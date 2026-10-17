import { env } from 'cloudflare:workers';
import { chapters, sources } from '../../../content';
import { authorized, body, HttpError, json, run } from '../../../lib/api';
import { retrieve } from '../../../lib/search';
import { validLessonId } from '../../../lib/validation';

type ChatRequest = {
  question?: unknown;
  lessonId?: unknown;
  includeNotes?: unknown;
};
type GeminiPayload = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };

const DAILY_LIMIT = 50;

function fallbackAnswer(question: string, matches: ReturnType<typeof retrieve>) {
  if (!matches.length) {
    return `Chưa tìm thấy đoạn giáo trình khớp trực tiếp với “${question}”. Hãy thêm tên phần mềm, đối tượng hoặc lệnh Autodesk/QGIS cần tra cứu. Tôi sẽ chỉ dùng nội dung đã có trong giáo trình và nguồn đính kèm.`;
  }

  const lines = matches.slice(0, 3).flatMap(({ lesson, chapter }, index) => [
    `${index + 1}. ${chapter} — ${lesson.title}`,
    `Mục tiêu: ${lesson.objective}`,
    ...lesson.steps.slice(0, 3).map((step, stepIndex) => `   ${stepIndex + 1}) ${step.title}: ${step.action} Kết quả cần thấy: ${step.expected}`),
    `Kiểm tra: ${lesson.checks.slice(0, 2).join('; ')}.`,
  ]);

  return `Đây là kết quả tra cứu trực tiếp trong giáo trình:\n\n${lines.join('\n')}\n\nCác bước trên là hướng dẫn đã tài liệu hóa. Trước khi nghiệm thu, hãy kiểm tra trên bản sao mô hình Civil 3D/Autodesk 2027 của dự án.`;
}

function buildContext(matches: ReturnType<typeof retrieve>, note: string) {
  const lessonContext = matches.map(({ lesson, chapter }) => {
    const steps = lesson.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.action} | Kết quả: ${step.expected}`).join('\n');
    return [
      `[${lesson.id}] ${chapter} — ${lesson.title}`,
      `Mục tiêu: ${lesson.objective}`,
      `Các bước:\n${steps}`,
      `QA: ${lesson.checks.join('; ')}`,
      `Lỗi thường gặp: ${lesson.mistakes.map(item => `${item.symptom} -> ${item.fix}`).join('; ')}`,
      `Nguồn: ${lesson.sourceIds.join(', ')}`,
    ].join('\n');
  }).join('\n\n---\n\n');

  return note ? `${lessonContext}\n\nGHI CHÚ CÁ NHÂN CỦA NGƯỜI DÙNG:\n${note}` : lessonContext;
}

async function askGemini(apiKey: string, model: string, question: string, context: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: 'Bạn là kỹ sư BIM hạ tầng. Chỉ trả lời bằng tiếng Việt từ CONTEXT được cung cấp. Nêu rõ menu/lệnh tiếng Anh nếu có. Không tự tạo tiêu chuẩn, dung sai hay tính năng phần mềm. Nếu context thiếu, nói rõ phần chưa đủ và đề nghị dữ liệu cần bổ sung. Phân biệt hướng dẫn đã tài liệu hóa với kết quả đã kiểm chứng trên mô hình thực.' }],
      },
      contents: [{ role: 'user', parts: [{ text: `CONTEXT:\n${context}\n\nCÂU HỎI:\n${question}` }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1400 },
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
  const data = await response.json() as GeminiPayload;
  const answer = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
  if (!answer) throw new Error('Gemini returned no answer');
  return answer;
}

export const POST = (request: Request) => run(async () => {
  const { user, db } = await authorized(request);
  const data = await body(request, 20000) as ChatRequest;
  const question = typeof data.question === 'string' ? data.question.trim() : '';
  const lessonId = typeof data.lessonId === 'string' && validLessonId(data.lessonId) ? data.lessonId : undefined;

  if (!question || question.length > 4000) throw new HttpError(400, 'Câu hỏi cần từ 1 đến 4.000 ký tự.');

  const matches = retrieve(chapters, question, lessonId);
  const citedIds = [...new Set(matches.flatMap(match => match.lesson.sourceIds))].slice(0, 8);
  const citations = citedIds.map(id => sources.find(source => source.id === id)).filter(Boolean);
  let note = '';
  if (data.includeNotes === true && lessonId) {
    const row = await db.prepare('SELECT text FROM notes WHERE user_id=? AND lesson_id=?').bind(user.userId, lessonId).first<{text:string}>();
    note = typeof row?.text === 'string' ? row.text.slice(0, 5000) : '';
  }

  const fallback = fallbackAnswer(question, matches);
  if (!env.GEMINI_API_KEY) {
    return json({ answer: fallback, citations, mode: 'retrieval', warning: 'Gemini chưa được cấu hình; câu trả lời đang dùng tra cứu trực tiếp trong giáo trình.' });
  }

  const day = new Date().toISOString().slice(0, 10);
  const usage = await db.prepare('SELECT count FROM ai_usage WHERE user_id=? AND day=?').bind(user.userId, day).first<{count:number}>();
  if ((usage?.count || 0) >= DAILY_LIMIT) {
    return json({ answer: fallback, citations, mode: 'retrieval', warning: `Đã đạt giới hạn ${DAILY_LIMIT} câu AI hôm nay; vẫn có thể tra cứu giáo trình.` });
  }

  try {
    const answer = await askGemini(env.GEMINI_API_KEY, env.GEMINI_MODEL || 'gemini-2.5-flash', question, buildContext(matches, note));
    await db.prepare('INSERT INTO ai_usage (user_id,day,count) VALUES (?,?,1) ON CONFLICT(user_id,day) DO UPDATE SET count=count+1').bind(user.userId, day).run();
    return json({ answer, citations, mode: 'gemini' });
  } catch {
    return json({ answer: fallback, citations, mode: 'retrieval', warning: 'Gemini tạm thời không phản hồi; đã chuyển sang tra cứu trực tiếp trong giáo trình.' });
  }
});
