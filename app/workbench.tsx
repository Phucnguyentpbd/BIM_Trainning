'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Cloud,
  CloudOff,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  ImagePlus,
  Map,
  Menu,
  NotebookPen,
  PackageCheck,
  PanelRightClose,
  RefreshCw,
  Route,
  Search,
  Send,
  ShieldCheck,
  Target,
  Trash2,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-react';
import { lessons, sources } from '../content';
import InstructionDiagram from './components/instruction-diagram';

interface WorkbenchProps {
  name: string | null;
  email: string | null;
}

type LessonProgress = 'not_started' | 'practicing' | 'completed';
type NoteRecord = { lessonId: string; text: string; revision: number; updatedAt: string };
type AttachmentRecord = { id: string; name: string; url: string; createdAt?: string };
type ConflictState = { current: NoteRecord | null; draft: string } | null;
type ChatMessage = { role: 'user' | 'assistant'; text: string; sources?: string[]; warning?: string };
type StateResponse = { notes: NoteRecord[]; progress: Array<{lessonId:string;status:string;checks:string[]}>; aiConfigured:boolean };
type ChatResponse = { answer:string; citations?: Array<{title:string}>; warning?:string };

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
  return payload as T;
}

export default function Workbench({ name, email }: WorkbenchProps) {
  const [activeLessonId, setActiveLessonId] = useState<string>('c01-l01');
  const [activeTab, setActiveTab] = useState<'notes' | 'sources' | 'ai'>('notes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [softwareFilter, setSoftwareFilter] = useState<string>('all');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(false);

  // Trạng thái tìm kiếm nhanh Modal (Ctrl + K)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dữ liệu cá nhân đồng bộ theo tài khoản ChatGPT của trang private.
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [noteRevisions, setNoteRevisions] = useState<Record<string, number>>({});
  const [currentNote, setCurrentNote] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('Đang kết nối cloud...');
  const [conflict, setConflict] = useState<ConflictState>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const [stateError, setStateError] = useState<string>('');
  const [attachments, setAttachments] = useState<AttachmentRecord[]>([]);
  const [attachmentBusy, setAttachmentBusy] = useState(false);

  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiConfigured, setAiConfigured] = useState(false);
  const [aiChat, setAiChat] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Tôi tra cứu trong 24 chương/80 bài về Civil 3D, Navisworks, InfraWorks, QGIS và 4D/5D. Mỗi câu trả lời kèm nguồn; nếu Gemini chưa được cấu hình, hệ thống vẫn trả kết quả trực tiếp từ giáo trình.',
      sources: ['Giáo trình BIM Tuyến 2027', 'Autodesk Help', 'QGIS Documentation']
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const loadState = useCallback(async () => {
    setSaveStatus('Đang đồng bộ...');
    setStateError('');
    try {
      const data = await readJson<StateResponse>(await fetch('/api/state', { cache: 'no-store' }));
      const noteMap: Record<string, string> = {};
      const revisionMap: Record<string, number> = {};
      const progressMap: Record<string, LessonProgress> = {};
      const stepMap: Record<string, boolean> = {};
      for (const note of data.notes || []) {
        noteMap[note.lessonId] = note.text;
        revisionMap[note.lessonId] = note.revision;
      }
      for (const item of data.progress || []) {
        progressMap[item.lessonId] = item.status === 'verified' ? 'completed' : item.status === 'practiced' ? 'practicing' : 'not_started';
        for (const stepKey of item.checks || []) stepMap[stepKey] = true;
      }
      setNotes(noteMap);
      setNoteRevisions(revisionMap);
      setLessonProgress(progressMap);
      setCompletedSteps(stepMap);
      setAiConfigured(Boolean(data.aiConfigured));
      setSaveStatus('Đã đồng bộ cloud');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu';
      setStateError(message);
      setSaveStatus('Chưa đồng bộ');
    }
  }, []);

  useEffect(() => {
    const savedActiveLesson = localStorage.getItem('bim_active_lesson');
    if (savedActiveLesson && lessons.some(lesson => lesson.id === savedActiveLesson)) setActiveLessonId(savedActiveLesson);
    void loadState();
  }, [loadState]);

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Tự động focus input khi mở modal tìm kiếm
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setModalSearchQuery('');
    }
  }, [isSearchModalOpen]);

  useEffect(() => {
    setCurrentNote(notes[activeLessonId] || '');
    localStorage.setItem('bim_active_lesson', activeLessonId);
    setConflict(null);
  }, [activeLessonId, notes]);

  const loadAttachments = useCallback(async (lessonId: string) => {
    try {
      const data = await readJson<{attachments:AttachmentRecord[]}>(await fetch(`/api/attachments?lessonId=${encodeURIComponent(lessonId)}`, { cache: 'no-store' }));
      setAttachments(data.attachments || []);
    } catch {
      setAttachments([]);
    }
  }, []);

  useEffect(() => { void loadAttachments(activeLessonId); }, [activeLessonId, loadAttachments]);

  // Bài học hiện tại
  const currentLesson = useMemo(() => {
    return lessons.find((l) => l.id === activeLessonId) || lessons[0];
  }, [activeLessonId]);

  // Danh sách bài học đã lọc theo phần mềm, chương và từ khóa tìm kiếm
  const filteredLessons = useMemo(() => {
    const q = searchQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    return lessons.filter((l) => {
      if (softwareFilter !== 'all' && l.software !== softwareFilter) return false;
      if (!q) return true;
      return (
        [l.id, l.title, l.objective, l.exercise, l.software].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q)
      );
    });
  }, [searchQuery, softwareFilter]);

  // Tìm kiếm toàn cục cho Modal Ctrl + K
  const modalSearchResults = useMemo(() => {
    const q = modalSearchQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    if (!q) return [];
    return lessons.filter((l) => {
      const haystack = [l.id, l.title, l.software, l.objective, ...l.steps.flatMap(s => [s.title, s.action]), ...l.mistakes.flatMap(m => [m.symptom, m.fix])].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return haystack.includes(q);
    }).slice(0, 15);
  }, [modalSearchQuery]);

  // Các chặng trên thanh ribbon theo phần mềm
  const stageOptions = useMemo(() => ([
    { value: 'all', code: '00', label: 'Toàn bộ lộ trình' },
    { value: 'Quy trình', code: '01', label: 'Quy trình và nền tảng' },
    { value: 'Civil 3D', code: '02', label: 'Civil 3D hậu corridor' },
    { value: 'Navisworks', code: '03', label: 'Navisworks phối hợp' },
    { value: 'InfraWorks', code: '04', label: 'InfraWorks diễn họa' },
    { value: 'QGIS', code: '05', label: 'QGIS và bản đồ số' },
    { value: '4D / 5D', code: '06', label: '4D / 5D và bàn giao' },
  ]), []);

  // Vị trí bài hiện tại trên lộ trình
  const lessonIndex = useMemo(() => lessons.findIndex((l) => l.id === activeLessonId), [activeLessonId]);
  const previousLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex >= 0 && lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null;

  // Số bước hoàn thành của bài hiện tại
  const checkedStepCount = useMemo(() => {
    return currentLesson.steps.reduce((count, _, idx) => (completedSteps[`${currentLesson.id}-s${idx}`] ? count + 1 : count), 0);
  }, [currentLesson, completedSteps]);

  // Tổng số bài hoàn thành và tiến độ toàn khóa
  const completedCount = useMemo(() => {
    return Object.values(lessonProgress).filter((s) => s === 'completed').length;
  }, [lessonProgress]);
  const courseProgress = lessons.length === 0 ? 0 : Math.round((completedCount / lessons.length) * 100);

  // Nguồn tài liệu gắn trực tiếp với bài đang mở
  const activeSourceList = useMemo(() => {
    return sources.filter((source) => currentLesson.sourceIds.includes(source.id));
  }, [currentLesson]);

  const saveNote = async (expectedRevision: number) => {
    setIsSavingNote(true);
    setSaveStatus('Đang lưu cloud...');
    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: activeLessonId, text: currentNote, expectedRevision }),
      });
      const data = await response.json().catch(() => ({})) as {error?:string;current?:NoteRecord;note?:NoteRecord};
      if (response.status === 409) {
        setConflict({ current: data.current || null, draft: currentNote });
        setSaveStatus('Có thay đổi từ máy khác');
        return;
      }
      if (!response.ok) throw new Error(data.error || 'Không thể lưu ghi chú');
      if (!data.note) throw new Error('Máy chủ không trả về ghi chú đã lưu');
      const note = data.note;
      setNotes(prev => ({ ...prev, [activeLessonId]: note.text }));
      setNoteRevisions(prev => ({ ...prev, [activeLessonId]: note.revision }));
      setConflict(null);
      setSaveStatus('Đã đồng bộ cloud');
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : 'Lỗi lưu cloud');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSaveNote = () => void saveNote(noteRevisions[activeLessonId] || 0);

  const syncProgress = async (lessonId: string, status: LessonProgress, steps: Record<string, boolean>) => {
    const checks = Object.entries(steps).filter(([key, done]) => done && key.startsWith(`${lessonId}-s`)).map(([key]) => key);
    setSaveStatus('Đang đồng bộ tiến độ...');
    try {
      await readJson(await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, status: status === 'completed' ? 'verified' : status === 'practicing' ? 'practiced' : 'read', checks }),
      }));
      setSaveStatus('Đã đồng bộ cloud');
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : 'Chưa đồng bộ tiến độ');
    }
  };

  // Đánh dấu hoàn thành bước thực hành
  const toggleStep = (stepKey: string) => {
    const updated = { ...completedSteps, [stepKey]: !completedSteps[stepKey] };
    setCompletedSteps(updated);
    if (currentLesson) {
      const allDone = currentLesson.steps.every((_, idx) => updated[`${currentLesson.id}-s${idx}`]);
      const status: LessonProgress = allDone ? 'completed' : 'practicing';
      setLessonProgress(prev => ({ ...prev, [currentLesson.id]: status }));
      void syncProgress(currentLesson.id, status, updated);
    }
  };

  const toggleLessonComplete = () => {
    const isDone = lessonProgress[currentLesson.id] === 'completed';
    const status: LessonProgress = isDone ? 'practicing' : 'completed';
    const updated = { ...completedSteps };
    currentLesson.steps.forEach((_, idx) => { updated[`${currentLesson.id}-s${idx}`] = !isDone; });
    setCompletedSteps(updated);
    setLessonProgress(prev => ({ ...prev, [currentLesson.id]: status }));
    void syncProgress(currentLesson.id, status, updated);
  };

  // Sao chép nhanh câu lệnh kỹ thuật
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSendAi = async () => {
    if (!aiPrompt.trim() || isAiLoading) return;
    const userMsg = aiPrompt;
    setAiPrompt('');
    setAiChat((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);
    try {
      const data = await readJson<ChatResponse>(await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg, lessonId: currentLesson.id, includeNotes: true }),
      }));
      setAiChat(prev => [...prev, {
        role: 'assistant',
        text: data.answer,
        sources: (data.citations || []).map(source => source.title),
        warning: data.warning,
      }]);
    } catch (error) {
      setAiChat(prev => [...prev, { role: 'assistant', text: error instanceof Error ? error.message : 'Không thể tra cứu lúc này.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const exportBackup = async () => {
    try {
      const response = await fetch('/api/backup', { cache: 'no-store' });
      if (!response.ok) throw new Error('Không thể tạo bản sao lưu');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bim-tuyen-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setSaveStatus('Đã xuất bản sao lưu');
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : 'Lỗi sao lưu');
    }
  };

  const importBackup = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      const data = await readJson<{added:number;skipped:number}>(await fetch('/api/backup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed) }));
      setSaveStatus(`Đã nhập ${data.added} mục; giữ ${data.skipped} mục hiện có`);
      await loadState();
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : 'Tệp sao lưu không hợp lệ');
    }
  };

  const uploadAttachment = async (file: File) => {
    setAttachmentBusy(true);
    try {
      const form = new FormData();
      form.append('lessonId', currentLesson.id);
      form.append('file', file);
      await readJson(await fetch('/api/attachments', { method: 'POST', body: form }));
      await loadAttachments(currentLesson.id);
      setSaveStatus('Đã tải ảnh lên cloud');
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : 'Không thể tải ảnh');
    } finally {
      setAttachmentBusy(false);
    }
  };

  const removeAttachment = async (id: string) => {
    try {
      await readJson(await fetch(`/api/attachments/${encodeURIComponent(id)}`, { method: 'DELETE' }));
      await loadAttachments(currentLesson.id);
      setSaveStatus('Đã bỏ ảnh khỏi bài học');
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : 'Không thể xóa ảnh');
    }
  };

  return (
    <div className="atlas-shell">
      <a className="skip-link" href="#lesson-content">Chuyển đến nội dung bài học</a>

      <header className="atlas-header">
        <div className="atlas-brand" aria-label="Hạ tầng BIM 2027">
          <span className="atlas-brand-mark" aria-hidden="true"><Route size={22} /></span>
          <span className="atlas-brand-copy">
            <strong>Hạ tầng BIM 2027</strong>
            <span>Route atlas · Civil to GIS</span>
          </span>
        </div>

        <button className="atlas-command" type="button" onClick={() => setIsSearchModalOpen(true)}>
          <Search size={17} aria-hidden="true" />
          <span>Tìm bài, lệnh hoặc lỗi kỹ thuật</span>
          <kbd>Ctrl K</kbd>
        </button>

        <div className="atlas-header-actions">
          <span className={`cloud-state ${stateError ? 'is-error' : 'is-ready'}`} title={`${name || ''} · ${email || ''}`}>
            {stateError ? <CloudOff size={16} aria-hidden="true" /> : <Cloud size={16} aria-hidden="true" />}
            <span>{stateError ? 'Cloud lỗi' : 'Đã kết nối'}</span>
          </span>
          <button className="icon-button" type="button" onClick={() => void loadState()} aria-label="Đồng bộ dữ liệu" title="Đồng bộ dữ liệu">
            <RefreshCw size={18} aria-hidden="true" />
          </button>
          <button className="primary-action" type="button" onClick={() => { setActiveTab('notes'); setIsRightPanelOpen(true); }}>
            <NotebookPen size={17} aria-hidden="true" />
            <span>Mở sổ công việc</span>
          </button>
        </div>
      </header>

      <nav className="stage-ribbon" aria-label="Các chặng trong quy trình BIM tuyến">
        <div className="stage-ribbon-inner">
          {stageOptions.map((stage) => {
            const count = stage.value === 'all' ? lessons.length : lessons.filter((lesson) => lesson.software === stage.value).length;
            return (
              <button
                key={stage.value}
                type="button"
                className={`stage-stop ${softwareFilter === stage.value ? 'is-active' : ''}`}
                aria-pressed={softwareFilter === stage.value}
                onClick={() => setSoftwareFilter(stage.value)}
              >
                <span className="stage-code">{stage.code}</span>
                <span className="stage-copy"><strong>{stage.label}</strong><small>{count} bài</small></span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="atlas-progress-strip">
        <span>Tiến độ toàn khóa</span>
        <div className="atlas-progress-track" role="progressbar" aria-label="Tiến độ toàn khóa" aria-valuemin={0} aria-valuemax={100} aria-valuenow={courseProgress}>
          <span style={{ width: `${courseProgress}%` }} />
        </div>
        <strong>{completedCount}/{lessons.length}</strong>
      </div>

      <div className="atlas-layout">
        <aside className="route-index" aria-label="Mục lục lộ trình học">
          <div className="route-index-head">
            <div>
              <span className="section-label"><Map size={15} aria-hidden="true" /> Mục lục tuyến học</span>
              <strong>{filteredLessons.length} điểm học</strong>
            </div>
            <button className="icon-button compact" type="button" onClick={() => setIsSearchModalOpen(true)} aria-label="Mở tìm kiếm nhanh">
              <Menu size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="route-filter">
            <label htmlFor="lesson-filter"><Filter size={15} aria-hidden="true" /><span>Lọc mục lục</span></label>
            <input
              id="lesson-filter"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tên bài, lệnh, thao tác..."
            />
          </div>

          <ol className="route-list">
            {filteredLessons.map((lesson, index) => {
              const isSelected = lesson.id === activeLessonId;
              const status = lessonProgress[lesson.id] || 'not_started';
              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    className={`route-row ${isSelected ? 'is-current' : ''}`}
                    aria-current={isSelected ? 'step' : undefined}
                    onClick={() => setActiveLessonId(lesson.id)}
                  >
                    <span className={`route-node is-${status}`} aria-hidden="true">
                      {status === 'completed' ? <Check size={13} /> : <span>{String(index + 1).padStart(2, '0')}</span>}
                    </span>
                    <span className="route-row-copy">
                      <span className="route-row-meta">{lesson.id.toUpperCase()} · {lesson.software} · {lesson.minutes} phút</span>
                      <strong>{lesson.title}</strong>
                    </span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ol>

          {filteredLessons.length === 0 && (
            <div className="empty-route">
              <Search size={22} aria-hidden="true" />
              <strong>Không có điểm học phù hợp</strong>
              <span>Đổi từ khóa hoặc chọn lại chặng ở thanh phía trên.</span>
            </div>
          )}
        </aside>

        <main id="lesson-content" className="lesson-canvas" tabIndex={-1}>
          <article className="field-sheet">
            <header className="lesson-heading">
              <div className="lesson-heading-topline">
                <span className="lesson-coordinate">{currentLesson.id.toUpperCase()}</span>
                <span>{currentLesson.software}</span>
                <span>Chương {currentLesson.chapterOrder}</span>
              </div>
              <div className="lesson-title-row">
                <div>
                  <h1>{currentLesson.title}</h1>
                  <p>{currentLesson.objective}</p>
                </div>
                <button
                  type="button"
                  className={`completion-control ${lessonProgress[currentLesson.id] === 'completed' ? 'is-complete' : ''}`}
                  onClick={toggleLessonComplete}
                >
                  {lessonProgress[currentLesson.id] === 'completed' ? <CheckCircle2 size={19} aria-hidden="true" /> : <Circle size={19} aria-hidden="true" />}
                  <span>{lessonProgress[currentLesson.id] === 'completed' ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</span>
                </button>
              </div>

              <div className="lesson-instrument-row">
                <span><BookOpenCheck size={16} aria-hidden="true" /> Bài {lessonIndex + 1}/{lessons.length}</span>
                <span><Target size={16} aria-hidden="true" /> {checkedStepCount}/{currentLesson.steps.length} bước</span>
                <span><FileCheck2 size={16} aria-hidden="true" /> {currentLesson.minutes} phút</span>
                <button type="button" onClick={() => { setActiveTab('sources'); setIsRightPanelOpen(true); }}>
                  <Database size={16} aria-hidden="true" /> {activeSourceList.length} nguồn
                </button>
              </div>
            </header>

            <section className="route-profile" aria-labelledby="profile-heading">
              <div className="route-profile-copy">
                <span className="section-label">Mặt cắt tiến độ bài</span>
                <h2 id="profile-heading">Từ đầu vào đến bằng chứng hoàn thành</h2>
              </div>
              <div className="profile-line" aria-hidden="true">
                <span className="profile-point is-done">Đầu vào</span>
                <span className={`profile-point ${checkedStepCount > 0 ? 'is-done' : ''}`}>Thực hành</span>
                <span className={`profile-point ${checkedStepCount === currentLesson.steps.length ? 'is-done' : ''}`}>QA</span>
                <span className={`profile-point ${lessonProgress[currentLesson.id] === 'completed' ? 'is-done' : ''}`}>Bàn giao</span>
              </div>
            </section>

            <div className="brief-grid">
              <section className="brief-block is-input" aria-labelledby="input-heading">
                <span className="brief-icon"><FileText size={18} aria-hidden="true" /></span>
                <div>
                  <h2 id="input-heading">Đầu vào cần có</h2>
                  <ul>{currentLesson.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </section>
              <section className="brief-block is-output" aria-labelledby="output-heading">
                <span className="brief-icon"><PackageCheck size={18} aria-hidden="true" /></span>
                <div>
                  <h2 id="output-heading">Sản phẩm cần bàn giao</h2>
                  <p>{currentLesson.deliverable}</p>
                </div>
              </section>
            </div>

            {currentLesson.diagram && <InstructionDiagram type={currentLesson.diagram} />}

            <section className="practice-section" aria-labelledby="practice-heading">
              <header className="section-heading">
                <div>
                  <span className="section-label">Trình tự thi công dữ liệu</span>
                  <h2 id="practice-heading">Thực hành từng bước</h2>
                </div>
                <span className="section-count">{checkedStepCount}/{currentLesson.steps.length} hoàn thành</span>
              </header>

              <ol className="practice-list">
                {currentLesson.steps.map((step, index) => {
                  const stepKey = `${currentLesson.id}-s${index}`;
                  const isDone = Boolean(completedSteps[stepKey]);
                  return (
                    <li key={stepKey} className={`practice-step ${isDone ? 'is-done' : ''}`}>
                      <label className="step-check">
                        <input type="checkbox" checked={isDone} onChange={() => toggleStep(stepKey)} />
                        <span>{isDone ? <Check size={17} aria-hidden="true" /> : index + 1}</span>
                        <span className="sr-only">Đánh dấu bước {index + 1}</span>
                      </label>
                      <div className="step-body">
                        <div className="step-title-row">
                          <h3>{step.title}</h3>
                          <button type="button" className="copy-control" onClick={() => copyToClipboard(step.action, `step-${index}`)}>
                            {copiedText === `step-${index}` ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                            <span>{copiedText === `step-${index}` ? 'Đã sao chép' : 'Sao chép'}</span>
                          </button>
                        </div>
                        <p className="step-action">{step.action}</p>
                        <div className="expected-result"><CheckCircle2 size={16} aria-hidden="true" /><span><strong>Kết quả:</strong> {step.expected}</span></div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <div className="qa-grid">
              <section className="qa-block is-warning" aria-labelledby="warning-heading">
                <header><TriangleAlert size={19} aria-hidden="true" /><h2 id="warning-heading">Lỗi cần chặn</h2></header>
                <ul>
                  {currentLesson.mistakes.map((mistake) => (
                    <li key={mistake.symptom}><strong>{mistake.symptom}</strong><span>{mistake.fix}</span></li>
                  ))}
                </ul>
              </section>
              <section className="qa-block is-check" aria-labelledby="qa-heading">
                <header><ShieldCheck size={19} aria-hidden="true" /><h2 id="qa-heading">Điều kiện chấp nhận</h2></header>
                <ul>{currentLesson.checks.map((check) => <li key={check}><Check size={15} aria-hidden="true" /><span>{check}</span></li>)}</ul>
              </section>
            </div>

            <section className="field-assignment" aria-labelledby="assignment-heading">
              <div className="assignment-number" aria-hidden="true">{String(currentLesson.chapterOrder).padStart(2, '0')}</div>
              <div>
                <span className="section-label">Bài tập tại dự án</span>
                <h2 id="assignment-heading">Tạo bằng chứng có thể kiểm tra lại</h2>
                <p>{currentLesson.exercise}</p>
                <dl><dt>Tệp hoặc hồ sơ cần nộp</dt><dd>{currentLesson.deliverable}</dd></dl>
              </div>
            </section>

            <nav className="lesson-pager" aria-label="Điều hướng bài học">
              <button type="button" disabled={!previousLesson} onClick={() => previousLesson && setActiveLessonId(previousLesson.id)}>
                <ChevronLeft size={18} aria-hidden="true" />
                <span><small>Bài trước</small><strong>{previousLesson?.title || 'Đầu lộ trình'}</strong></span>
              </button>
              <button type="button" disabled={!nextLesson} onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}>
                <span><small>Bài tiếp theo</small><strong>{nextLesson?.title || 'Cuối lộ trình'}</strong></span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </nav>
          </article>
        </main>
      </div>

      {isRightPanelOpen && (
        <>
          <button className="drawer-scrim" type="button" aria-label="Đóng sổ công việc" onClick={() => setIsRightPanelOpen(false)} />
          <aside className="evidence-drawer" role="dialog" aria-modal="true" aria-label="Sổ công việc của bài học">
            <header className="drawer-heading">
              <div>
                <span className="section-label">{currentLesson.id.toUpperCase()}</span>
                <h2>Sổ công việc</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setIsRightPanelOpen(false)} aria-label="Đóng sổ công việc">
                <PanelRightClose size={20} aria-hidden="true" />
              </button>
            </header>

            <div className="drawer-tabs" role="tablist" aria-label="Nội dung sổ công việc">
              <button type="button" role="tab" aria-selected={activeTab === 'notes'} className={activeTab === 'notes' ? 'is-active' : ''} onClick={() => setActiveTab('notes')}><NotebookPen size={16} aria-hidden="true" />Ghi chú</button>
              <button type="button" role="tab" aria-selected={activeTab === 'sources'} className={activeTab === 'sources' ? 'is-active' : ''} onClick={() => setActiveTab('sources')}><Database size={16} aria-hidden="true" />Nguồn</button>
              <button type="button" role="tab" aria-selected={activeTab === 'ai'} className={activeTab === 'ai' ? 'is-active' : ''} onClick={() => setActiveTab('ai')}><Bot size={16} aria-hidden="true" />Tra cứu</button>
            </div>

            {activeTab === 'notes' && (
              <div className="drawer-content">
                <div className="sync-line"><span>{saveStatus}</span><span>Phiên bản {noteRevisions[activeLessonId] || 0}</span></div>
                <label className="field-label" htmlFor="lesson-note">Nhật ký kỹ thuật của bài này</label>
                <textarea
                  id="lesson-note"
                  value={currentNote}
                  onChange={(event) => setCurrentNote(event.target.value)}
                  placeholder="Ghi lý trình, tọa độ, thông số, lỗi đã gặp và cách xử lý..."
                />
                <div className="form-actions">
                  <button className="primary-action" type="button" onClick={handleSaveNote} disabled={isSavingNote}><CheckCircle2 size={16} aria-hidden="true" />{isSavingNote ? 'Đang lưu' : 'Lưu ghi chú'}</button>
                  <button className="secondary-action" type="button" onClick={() => {
                    const blob = new Blob([currentNote], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `ghi-chu-${currentLesson.id}.md`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}><Download size={16} aria-hidden="true" />Xuất MD</button>
                </div>

                {conflict && (
                  <section className="conflict-box" aria-live="polite">
                    <strong>Ghi chú đã thay đổi trên thiết bị khác</strong>
                    <p>Bản đang soạn vẫn được giữ. So sánh trước khi chọn bản cần dùng.</p>
                    {conflict.current && <pre>Bản cloud r{conflict.current.revision}: {conflict.current.text}</pre>}
                    <div className="form-actions">
                      <button className="secondary-action" type="button" onClick={() => {
                        const remote = conflict.current;
                        if (remote) {
                          setCurrentNote(remote.text);
                          setNotes((previous) => ({ ...previous, [activeLessonId]: remote.text }));
                          setNoteRevisions((previous) => ({ ...previous, [activeLessonId]: remote.revision }));
                        }
                        setConflict(null);
                        setSaveStatus('Đã dùng bản cloud');
                      }}>Dùng bản cloud</button>
                      <button className="warning-action" type="button" onClick={() => {
                        if (conflict.current) {
                          setCurrentNote(conflict.draft);
                          void saveNote(conflict.current.revision);
                        }
                      }}>Ghi đè bản đang soạn</button>
                    </div>
                  </section>
                )}

                <section className="drawer-section" aria-labelledby="evidence-heading">
                  <header><div><span className="section-label">Minh chứng</span><h3 id="evidence-heading">Ảnh thực hành</h3></div></header>
                  <label className="upload-control">
                    <ImagePlus size={17} aria-hidden="true" />
                    <span>{attachmentBusy ? 'Đang tải ảnh' : 'Thêm ảnh'}</span>
                    <input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp" disabled={attachmentBusy} onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadAttachment(file);
                      event.currentTarget.value = '';
                    }} />
                  </label>
                  <p className="helper-text">PNG, JPEG hoặc WebP · tối đa 5 MB · lưu theo tài khoản.</p>
                  {attachments.length > 0 ? (
                    <div className="attachment-grid">
                      {attachments.map((attachment) => (
                        <figure key={attachment.id}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={attachment.url} alt={attachment.name} />
                          <figcaption title={attachment.name}>{attachment.name}</figcaption>
                          <button type="button" onClick={() => void removeAttachment(attachment.id)} aria-label={`Bỏ ảnh ${attachment.name}`}><Trash2 size={15} aria-hidden="true" /></button>
                        </figure>
                      ))}
                    </div>
                  ) : <div className="empty-evidence">Chưa có ảnh minh chứng.</div>}
                </section>

                <section className="drawer-section" aria-labelledby="backup-heading">
                  <header><div><span className="section-label">Dữ liệu cá nhân</span><h3 id="backup-heading">Sao lưu và phục hồi</h3></div></header>
                  <div className="form-actions">
                    <button className="secondary-action" type="button" onClick={() => void exportBackup()}><Download size={16} aria-hidden="true" />Xuất JSON</button>
                    <label className="secondary-action upload-label"><Upload size={16} aria-hidden="true" />Nhập JSON<input type="file" accept="application/json,.json" className="sr-only" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void importBackup(file);
                      event.currentTarget.value = '';
                    }} /></label>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'sources' && (
              <div className="drawer-content">
                <p className="drawer-lede">Các nguồn gắn trực tiếp với bài đang mở. Kiểm tra phiên bản trước khi áp dụng vào hồ sơ dự án.</p>
                <div className="source-list">
                  {activeSourceList.map((source) => (
                    <article key={source.id} className="source-row">
                      <span className="source-kind">{source.kind === 'official' ? 'Tài liệu chính thức' : 'Google Drive'}</span>
                      <h3>{source.title}</h3>
                      <p>Phiên bản: {source.version}</p>
                      <a href={source.url} target="_blank" rel="noreferrer">Mở tài liệu <ExternalLink size={15} aria-hidden="true" /></a>
                    </article>
                  ))}
                </div>
                <a className="drive-link" href="https://drive.google.com/drive/folders/130hcuN6KDyFZKkVeqYaNBMf47EBvp2Fk" target="_blank" rel="noreferrer">
                  <Database size={18} aria-hidden="true" /><span><strong>Kho dữ liệu thực hành</strong><small>Civil 3D · BIM–GIS · DEM · corridor mẫu</small></span><ExternalLink size={17} aria-hidden="true" />
                </a>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="drawer-content ai-workspace">
                <div className={`ai-mode ${aiConfigured ? 'is-live' : 'is-local'}`}>
                  <Bot size={18} aria-hidden="true" />
                  <span>{aiConfigured ? 'Gemini đang trả lời từ ngữ cảnh giáo trình' : 'Đang tra cứu trực tiếp trong giáo trình'}</span>
                </div>
                <div className="chat-log" aria-live="polite">
                  {aiChat.map((message, index) => (
                    <article key={`${message.role}-${index}`} className={`chat-message is-${message.role}`}>
                      <header>{message.role === 'user' ? 'Câu hỏi của bạn' : 'Kết quả tra cứu'}</header>
                      <p>{message.text}</p>
                      {message.sources && message.sources.length > 0 && <footer><Database size={14} aria-hidden="true" /><span>{message.sources.join(' · ')}</span></footer>}
                      {message.warning && <div className="message-warning">{message.warning}</div>}
                    </article>
                  ))}
                  {isAiLoading && <div className="ai-loading">Đang đối chiếu nội dung và nguồn...</div>}
                </div>
                <div className="ai-composer">
                  <label className="field-label" htmlFor="ai-question">Câu hỏi kỹ thuật</label>
                  <div>
                    <input id="ai-question" type="text" value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void handleSendAi()} placeholder="Ví dụ: kiểm tra gì trước khi xuất corridor?" />
                    <button type="button" onClick={() => void handleSendAi()} disabled={isAiLoading || !aiPrompt.trim()} aria-label="Gửi câu hỏi"><Send size={18} aria-hidden="true" /></button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </>
      )}

      {isSearchModalOpen && (
        <div className="search-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setIsSearchModalOpen(false); }}>
          <section className="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-dialog-heading">
            <header>
              <div><span className="section-label">Tra cứu toàn bộ atlas</span><h2 id="search-dialog-heading">Tìm bài học và lỗi kỹ thuật</h2></div>
              <button className="icon-button" type="button" onClick={() => setIsSearchModalOpen(false)} aria-label="Đóng tìm kiếm"><X size={20} aria-hidden="true" /></button>
            </header>
            <label className="search-field" htmlFor="global-search">
              <Search size={20} aria-hidden="true" />
              <input ref={searchInputRef} id="global-search" type="search" value={modalSearchQuery} onChange={(event) => setModalSearchQuery(event.target.value)} placeholder="Corridor, target, vật liệu, clash, tọa độ, InfraWorks..." />
              <kbd>Esc</kbd>
            </label>
            <div className="search-results">
              {!modalSearchQuery.trim() && <div className="search-empty"><Route size={26} aria-hidden="true" /><span>Nhập từ khóa để tìm trong 24 chương và 80 bài thực hành.</span></div>}
              {modalSearchQuery.trim() && modalSearchResults.length === 0 && <div className="search-empty"><Search size={26} aria-hidden="true" /><span>Không tìm thấy bài phù hợp với “{modalSearchQuery}”.</span></div>}
              {modalSearchResults.map((lesson) => (
                <button key={lesson.id} type="button" onClick={() => { setActiveLessonId(lesson.id); setIsSearchModalOpen(false); }}>
                  <span className="search-result-code">{lesson.id.toUpperCase()}</span>
                  <span><strong>{lesson.title}</strong><small>{lesson.software} · Chương {lesson.chapterOrder} · {lesson.minutes} phút</small></span>
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
