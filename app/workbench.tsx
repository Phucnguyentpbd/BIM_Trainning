'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

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

  // Tổng số bài hoàn thành
  const completedCount = useMemo(() => {
    return Object.values(lessonProgress).filter((s) => s === 'completed').length;
  }, [lessonProgress]);

  // Sao chép lệnh CAD / text
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
    <div className="app-shell flex flex-col h-screen w-screen overflow-hidden bg-[#0c1017] text-slate-200 font-sans antialiased">

      {/* ─── TOPBAR HEADER (BIM COACHING 2027) ─────────────────────────────────── */}
      <header className="app-header min-h-14 border-b border-[#232d3f] bg-[#131822] px-4 flex items-center justify-between shrink-0 z-20">
        {/* Brand / Logo: BIM COACHING */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold text-base">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white tracking-wide text-sm font-mono">BIM COACHING</span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-sky-950 text-sky-400 border border-sky-800 rounded font-mono">
                2027 PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Giáo trình Thực hành & Huấn luyện BIM Tuyến, Hạ tầng GIS
            </div>
          </div>
        </div>

        {/* Center: Command Switcher Quick Search (Ctrl+K) */}
        <div className="header-search flex-1 max-w-md mx-6">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-[#0c1017] hover:bg-[#18202d] border border-[#232d3f] rounded-lg transition-all shadow-inner group"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Tìm nhanh bài học, lệnh CAD, quy trình, lỗi...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-[#1a2332] text-slate-300 border border-[#2d3a4f] rounded font-mono">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5">
          <div className={`cloud-pill flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-full border ${stateError ? 'bg-rose-950/60 border-rose-800/60 text-rose-400' : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'}`} title={`${name || ''} · ${email || ''}`}>
            <span className={`w-2 h-2 rounded-full ${stateError ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
            <span className="text-[11px] font-medium font-mono">{stateError ? 'Cloud lỗi' : 'Cloud cá nhân'}</span>
          </div>

          {/* Sync Button */}
          <button
            onClick={() => void loadState()}
            title="Đồng bộ tiến độ học tập và ghi chú"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#18202d] hover:bg-[#232d3f] border border-[#232d3f] rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Đồng bộ</span>
          </button>

          {/* New Note Button */}
          <button
            onClick={() => {
              setIsRightPanelOpen(true);
              setActiveTab('notes');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 rounded-lg shadow-md shadow-sky-600/20 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Ghi chú</span>
          </button>

          {/* Toggle Panel Phải */}
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            title="Đóng / Mở Bảng Ghi chú & Nguồn tra cứu"
            className={`p-1.5 text-xs rounded-lg border transition-colors ${
              isRightPanelOpen
                ? 'bg-[#18202d] border-sky-500/50 text-sky-400'
                : 'bg-[#18202d] border-[#232d3f] text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </header>

      {stateError && (
        <div role="status" className="border-b border-rose-900/70 bg-rose-950/70 px-4 py-2 text-xs text-rose-200">
          Chưa tải được dữ liệu cloud: {stateError}. Nội dung giáo trình vẫn xem được; hãy bấm Đồng bộ để thử lại.
        </div>
      )}

      {/* ─── MAIN WORKSPACE (2 HOẶC 3 CỘT) ──────────────────────────────────── */}
      <div className="workspace-grid flex-1 flex overflow-hidden">

        {/* ─── CỘT TRÁI: SIDEBAR DANH SÁCH BÀI THỰC HÀNH ───────────────────────── */}
        <aside className="lesson-sidebar w-80 border-r border-[#232d3f] bg-[#131822] flex flex-col shrink-0">

          {/* Bộ lọc Chuyên mục Phân hệ */}
          <div className="p-3 border-b border-[#232d3f]">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Phân hệ Kỹ thuật BIM & GIS
            </label>
            <div className="relative">
              <select
                value={softwareFilter}
                onChange={(e) => setSoftwareFilter(e.target.value)}
                className="w-full text-xs bg-[#0c1017] text-slate-200 border border-[#232d3f] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
              >
                <option value="all">📂 Tất cả phân hệ (All Software)</option>
                <option value="Civil 3D">🛣️ Civil 3D — Thiết kế tuyến & San nền</option>
                <option value="Navisworks">🔍 Navisworks — Phối hợp & Clash Test</option>
                <option value="InfraWorks">🌐 InfraWorks — Mô phỏng bối cảnh 3D</option>
                <option value="QGIS">🗺️ QGIS — Bản đồ & Tọa độ GIS</option>
                <option value="4D / 5D">⏱️ 4D / 5D — Tiến độ & Khối lượng BIM</option>
              </select>
              <div className="absolute right-2.5 top-2.5 pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Quick Search Filter in List */}
          <div className="px-3 pt-2 pb-2 border-b border-[#232d3f]/60">
            <div className="relative">
              <input
                type="text"
                placeholder="Lọc bài học theo tên, lệnh, thao tác..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-[#0c1017] text-slate-200 border border-[#232d3f] rounded-md pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-sky-500 placeholder-slate-500"
              />
              <svg className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
          </div>

          {/* Danh sách Thẻ Bài học */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
            {filteredLessons.map((lesson) => {
              const isSelected = lesson.id === activeLessonId;
              const isDone = lessonProgress[lesson.id] === 'completed';

              return (
                <div
                  key={lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-[#1e293b] shadow-md shadow-sky-500/10'
                      : 'border-[#232d3f] bg-[#18202d] hover:bg-[#1e293b] hover:border-sky-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800 rounded">
                      {lesson.id.toUpperCase()}
                    </span>
                    {isDone ? (
                      <span className="text-[10px] text-emerald-400 font-medium flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>hoàn thành</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {lesson.minutes}p
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-white line-clamp-2 mb-1.5">
                    {lesson.title}
                  </h4>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                    <span className="text-sky-400">{lesson.software}</span>
                    <span>•</span>
                    <span>Chương {lesson.chapterOrder}</span>
                    <span>•</span>
                    <span>{lesson.minutes} phút</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-2.5 border-t border-[#232d3f] bg-[#0c1017] flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono text-sky-400">Tổng số: {filteredLessons.length} bài</span>
            <span className="text-slate-500">Đã hoàn thành {completedCount}/{lessons.length}</span>
          </div>
        </aside>

        {/* ─── CỘT GIỮA: RIGHT CANVAS (VIEWER CHI TIẾT BÀI HỌC) ────────────────── */}
        <main className="flex-1 bg-[#0c1017] flex flex-col overflow-hidden">

          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full scrollbar-thin">

            {/* Header Bài học */}
            <div className="border-b border-[#232d3f] pb-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800 rounded-md">
                    {currentLesson.id.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-md flex items-center space-x-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>{lessonProgress[currentLesson.id] === 'completed' ? 'đã hoàn thành' : 'đang học'}</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Chương {currentLesson.chapterOrder}</span>
                  <span className="text-xs text-slate-500 font-mono">• Thời lượng: {currentLesson.minutes} phút</span>
                </div>

                {/* Action Edit Button */}
                <button
                  onClick={toggleLessonComplete}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                    lessonProgress[currentLesson.id] === 'completed'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                      : 'text-slate-200 bg-[#18202d] hover:bg-[#232d3f] border-[#232d3f]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>{lessonProgress[currentLesson.id] === 'completed' ? '✓ Đã hoàn thành' : 'Đánh dấu hoàn thành'}</span>
                </button>
              </div>

              <h1 className="text-xl font-bold text-white tracking-tight leading-snug mb-2">
                {currentLesson.title}
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                {currentLesson.objective}
              </p>

              {/* Pill Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="px-2 py-0.5 text-[11px] font-medium bg-[#18202d] text-sky-300 border border-[#2d3a4f] rounded font-mono">
                  {currentLesson.software}
                </span>
                <span className="px-2 py-0.5 text-[11px] font-medium bg-[#18202d] text-sky-300 border border-[#2d3a4f] rounded font-mono">
                  Chương {currentLesson.chapterOrder}
                </span>
                <span className="px-2 py-0.5 text-[11px] font-medium bg-[#18202d] text-slate-400 border border-[#232d3f] rounded font-mono">
                  Phiên bản 2027
                </span>
                <span className="px-2 py-0.5 text-[11px] font-medium bg-[#18202d] text-slate-400 border border-[#232d3f] rounded font-mono">
                  {currentLesson.deliverable}
                </span>
              </div>
            </div>

            {/* Section Mục tiêu & Điều kiện tiên quyết (2 Cột) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/15">
                <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs mb-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>MỤC TIÊU & YÊU CẦU ĐẦU RA</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                  {currentLesson.objective}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-sky-900/40 bg-sky-950/15">
                <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs mb-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>ĐIỀU KIỆN TIÊN QUYẾT & ĐẦU VÀO</span>
                </div>
                <ul className="text-xs text-slate-200 space-y-1 font-mono">
                  {currentLesson.prerequisites.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
            </div>

            {currentLesson.diagram && <InstructionDiagram type={currentLesson.diagram} />}

            {/* Section Quy trình Thực hành Chuẩn */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>QUY TRÌNH THỰC HÀNH TỪNG BƯỚC ({currentLesson.steps.length} BƯỚC)</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Tick từng bước để kiểm soát tiến độ
                </span>
              </div>

              <div className="bg-[#131822] border border-[#232d3f] rounded-xl divide-y divide-[#232d3f]/70 overflow-hidden shadow-lg">
                {currentLesson.steps.map((step, idx) => {
                  const stepKey = `${currentLesson.id}-s${idx}`;
                  const isStepDone = completedSteps[stepKey];

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(stepKey)}
                      className={`p-4 transition-colors cursor-pointer flex items-start space-x-3.5 ${
                        isStepDone ? 'bg-emerald-950/15' : 'hover:bg-[#18202d]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!isStepDone}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 rounded border-[#232d3f] bg-[#0c1017] text-sky-500 focus:ring-0 cursor-pointer"
                      />

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1.5">
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#18202d] text-sky-400 border border-[#2d3a4f] rounded">
                            BƯỚC {idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-white">
                            {step.title}
                          </h4>
                        </div>

                        {/* Thao tác & Lệnh */}
                        <div className="relative group/box mb-2">
                          <div className="text-xs text-slate-200 leading-relaxed font-mono bg-[#0c1017] p-3 rounded-lg border border-[#232d3f] whitespace-pre-wrap">
                            {step.action}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(step.action, `step-${idx}`);
                            }}
                            className="absolute top-2 right-2 px-2 py-1 text-[10px] font-mono bg-[#18202d] hover:bg-[#232d3f] text-slate-300 border border-[#232d3f] rounded transition-opacity opacity-0 group-hover/box:opacity-100 flex items-center space-x-1"
                          >
                            <span>{copiedText === `step-${idx}` ? '✓ Đã copy' : 'Copy'}</span>
                          </button>
                        </div>

                        {/* Kết quả mong đợi */}
                        <div className="text-[11px] text-emerald-400 flex items-center space-x-1.5 font-medium">
                          <span className="text-emerald-500">✓ Kết quả cần thấy:</span>
                          <span>{step.expected}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section Cảnh báo & Tiêu chuẩn QA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Cảnh báo kỹ thuật */}
              <div className="p-4 rounded-xl border border-rose-900/50 bg-rose-950/20">
                <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs mb-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>CẢNH BÁO KỸ THUẬT & LỖI THƯỜNG GẶP</span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-200 space-y-1 font-mono">
                  {currentLesson.mistakes.map((m, i) => (
                    <li key={i}>{m.symptom}: {m.fix}</li>
                  ))}
                </ul>
              </div>

              {/* Tiêu chí nghiệm thu QA */}
              <div className="p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/15">
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs mb-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>TIÊU CHÍ KIỂM TRA CHẤT LƯỢNG (QA CHECK)</span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-200 space-y-1 font-mono">
                  {currentLesson.checks.map((chk, i) => (
                    <li key={i}>{chk}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bài tập Thực hành & Sản phẩm */}
            <div className="p-4 rounded-xl border border-[#232d3f] bg-[#131822]">
              <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>BÀI TẬP VẬN DỤNG & SẢN PHẨM BÀN GIAO</span>
              </div>
              <div className="text-xs text-slate-300 space-y-2">
                <div><strong>Yêu cầu:</strong> {currentLesson.exercise}</div>
                <div className="flex items-center space-x-2">
                  <strong>Sản phẩm nộp:</strong>
                  <span className="px-2 py-0.5 rounded bg-[#18202d] text-sky-400 border border-sky-800 font-mono text-[11px]">
                    {currentLesson.deliverable}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* ─── CỘT PHẢI: GHI CHÚ, NGUỒN GDRIVE & HỎI AI (COLLAPSIBLE) ──────────── */}
        {isRightPanelOpen && (
          <aside className="assistant-panel w-96 border-l border-[#232d3f] bg-[#131822] flex flex-col shrink-0">
            {/* Tab Headers */}
            <div className="flex border-b border-[#232d3f] bg-[#0c1017]">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center space-x-1.5 ${
                  activeTab === 'notes'
                    ? 'border-sky-500 text-sky-400 bg-[#131822]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📝 Ghi chú</span>
              </button>
              <button
                onClick={() => setActiveTab('sources')}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center space-x-1.5 ${
                  activeTab === 'sources'
                    ? 'border-sky-500 text-sky-400 bg-[#131822]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📚 Nguồn</span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center space-x-1.5 ${
                  activeTab === 'ai'
                    ? 'border-sky-500 text-sky-400 bg-[#131822]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🤖 Kỹ sư AI</span>
              </button>
            </div>

            {/* Tab 1: Ghi chú cá nhân */}
            {activeTab === 'notes' && (
              <div className="flex-1 flex flex-col p-4 overflow-y-auto scrollbar-thin">
                <div className="flex items-center justify-between mb-2 text-xs font-mono">
                  <span className="text-slate-400">Ghi chú cho {currentLesson.id.toUpperCase()}</span>
                  <span className={`text-[11px] font-medium ${saveStatus.includes('Đã') ? 'text-emerald-400' : 'text-amber-400'}`}>{saveStatus}</span>
                </div>
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Ghi chép thông số kỹ thuật, mốc lý trình, tọa độ, lỗi gặp phải hoặc kinh nghiệm thực hành bài này..."
                  className="min-h-52 p-3 text-xs bg-[#0c1017] border border-[#232d3f] rounded-lg text-slate-200 resize-y focus:outline-none focus:border-sky-500 leading-relaxed font-mono"
                />
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleSaveNote}
                    disabled={isSavingNote}
                    className="flex-1 py-1.5 px-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-sky-600/20 transition-all disabled:opacity-50"
                  >
                    {isSavingNote ? 'Đang lưu...' : 'Lưu ghi chú'}
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([currentNote], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `ghi-chu-${currentLesson.id}.md`;
                      a.click();
                    }}
                    className="py-1.5 px-3 bg-[#18202d] hover:bg-[#232d3f] text-slate-300 text-xs font-medium rounded-lg border border-[#232d3f]"
                  >
                    Xuất MD
                  </button>
                </div>

                {conflict && (
                  <div className="mt-3 rounded-lg border border-amber-700/70 bg-amber-950/30 p-3 text-xs text-amber-100">
                    <strong>Ghi chú đã đổi trên thiết bị khác.</strong>
                    <p className="mt-1 text-amber-200/80">Bản đang soạn vẫn được giữ trong ô phía trên. Chọn bản cloud hoặc ghi đè sau khi đã so sánh.</p>
                    {conflict.current && <pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap rounded bg-black/20 p-2 text-[11px]">Bản cloud r{conflict.current.revision}: {conflict.current.text}</pre>}
                    <div className="mt-2 flex gap-2">
                      <button className="rounded border border-amber-700 px-2 py-1 hover:bg-amber-900/50" onClick={() => {
                        const remote = conflict.current;
                        if (remote) {
                          setCurrentNote(remote.text);
                          setNotes(prev => ({ ...prev, [activeLessonId]: remote.text }));
                          setNoteRevisions(prev => ({ ...prev, [activeLessonId]: remote.revision }));
                        }
                        setConflict(null);
                        setSaveStatus('Đã dùng bản cloud');
                      }}>Dùng bản cloud</button>
                      <button className="rounded bg-amber-600 px-2 py-1 font-semibold text-black hover:bg-amber-500" onClick={() => {
                        if (conflict.current) {
                          setCurrentNote(conflict.draft);
                          void saveNote(conflict.current.revision);
                        }
                      }}>Ghi đè bằng bản đang soạn</button>
                    </div>
                  </div>
                )}

                <section className="mt-5 border-t border-[#232d3f] pt-4" aria-labelledby="attachment-heading">
                  <div className="flex items-center justify-between gap-2">
                    <h3 id="attachment-heading" className="text-xs font-semibold text-white">Ảnh minh chứng bài thực hành</h3>
                    <label className="cursor-pointer rounded-md border border-[#2d3a4f] bg-[#18202d] px-2.5 py-1 text-[11px] text-sky-300 hover:border-sky-600">
                      {attachmentBusy ? 'Đang tải...' : '+ Thêm ảnh'}
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={attachmentBusy}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void uploadAttachment(file);
                          event.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">PNG, JPEG hoặc WebP, tối đa 5 MB. Ảnh lưu riêng trong kho cloud của tài khoản.</p>
                  {attachments.length ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {attachments.map(item => (
                        <figure key={item.id} className="group relative overflow-hidden rounded-lg border border-[#232d3f] bg-[#0c1017]">
                          {/* Ảnh dùng API riêng có xác thực; không thể đưa qua bộ tối ưu ảnh công khai. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.url} alt={item.name} className="h-24 w-full object-cover" />
                          <figcaption className="truncate px-2 py-1 text-[10px] text-slate-400" title={item.name}>{item.name}</figcaption>
                          <button onClick={() => void removeAttachment(item.id)} className="absolute right-1 top-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-rose-300 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">Bỏ ảnh</button>
                        </figure>
                      ))}
                    </div>
                  ) : <p className="mt-3 rounded-lg border border-dashed border-[#2d3a4f] p-3 text-center text-[11px] text-slate-500">Chưa có ảnh minh chứng cho bài này.</p>}
                </section>

                <section className="mt-5 border-t border-[#232d3f] pt-4">
                  <h3 className="text-xs font-semibold text-white">Sao lưu dữ liệu cá nhân</h3>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => void exportBackup()} className="rounded-md border border-[#2d3a4f] bg-[#18202d] px-2.5 py-1.5 text-[11px] text-slate-200 hover:border-sky-600">Xuất JSON</button>
                    <label className="cursor-pointer rounded-md border border-[#2d3a4f] bg-[#18202d] px-2.5 py-1.5 text-[11px] text-slate-200 hover:border-sky-600">
                      Nhập JSON
                      <input type="file" accept="application/json,.json" className="sr-only" onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void importBackup(file);
                        event.currentTarget.value = '';
                      }} />
                    </label>
                  </div>
                  <p className="mt-2 text-[10px] leading-relaxed text-slate-500">Bản JSON gồm ghi chú, checklist và liên kết ảnh. Khi nhập, dữ liệu đang có được giữ nguyên.</p>
                </section>
              </div>
            )}

            {/* Tab 2: Nguồn tra cứu Google Drive */}
            {activeTab === 'sources' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                <div className="text-xs text-slate-400 font-medium font-mono">
                  Tài liệu đính kèm bài học này:
                </div>
                {currentLesson.sourceIds.map((srcId) => {
                  const src = sources.find((s) => s.id === srcId);
                  if (!src) return null;
                  return (
                    <div key={src.id} className="p-3 rounded-lg bg-[#0c1017] border border-[#232d3f] text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sky-400 truncate">{src.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border bg-sky-950 text-sky-400 border-sky-800 font-mono">
                          {src.kind === 'official' ? 'Chính thức' : 'GDrive'}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mb-2 font-mono">Phiên bản: {src.version}</div>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-sky-400 hover:text-sky-300 underline flex items-center space-x-1"
                      >
                        <span>Mở tài liệu / Mẫu bài tập</span> ↗
                      </a>
                    </div>
                  );
                })}

                <div className="pt-3 border-t border-[#232d3f]">
                  <div className="text-xs text-slate-400 font-medium mb-2 font-mono">Kho tài nguyên Google Drive dùng chung:</div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-[#0c1017] border border-[#232d3f] text-slate-300">
                      <strong className="text-white">Civil Design:</strong> Bộ tài liệu học Civil 3D, Navisworks và InfraWorks.
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0c1017] border border-[#232d3f] text-slate-300">
                      <strong className="text-white">BIM–GIS:</strong> Hướng dẫn tích hợp mô hình và dữ liệu bản đồ.
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0c1017] border border-[#232d3f] text-slate-300">
                      <strong className="text-white">Dữ liệu thực hành:</strong> DEM, ranh hành chính và mẫu corridor; cần quyền Google Drive tương ứng.
                    </div>
                    <a href="https://drive.google.com/drive/folders/130hcuN6KDyFZKkVeqYaNBMf47EBvp2Fk" target="_blank" rel="noreferrer" className="block rounded-lg border border-sky-900/70 bg-sky-950/20 p-2.5 text-sky-300 hover:border-sky-600">Mở thư mục tài liệu BIM dùng chung ↗</a>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Hỏi đáp Kỹ sư AI */}
            {activeTab === 'ai' && (
              <div className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className={`mb-3 rounded-md border px-2.5 py-2 text-[10px] font-mono ${aiConfigured ? 'border-emerald-900/70 bg-emerald-950/30 text-emerald-300' : 'border-amber-900/70 bg-amber-950/30 text-amber-300'}`}>
                  {aiConfigured ? 'Gemini đang hoạt động · trả lời từ ngữ cảnh giáo trình' : 'Chế độ tra cứu giáo trình · chưa có khóa Gemini trên máy chủ'}
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 scrollbar-thin">
                  {aiChat.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-sky-950/40 text-slate-200 border border-sky-800/50 ml-4'
                          : 'bg-[#0c1017] text-slate-200 border border-[#232d3f] mr-4'
                      }`}
                    >
                      <div className="font-semibold text-[11px] mb-1 text-slate-400 font-mono">
                        {msg.role === 'user' ? 'Kỹ sư' : 'Trợ lý AI BIM'}
                      </div>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#232d3f] text-[10px] text-sky-400 font-mono">
                          📚 Nguồn: {msg.sources.join(' • ')}
                        </div>
                      )}
                      {msg.warning && <div className="mt-2 rounded border border-amber-900/60 bg-amber-950/30 p-2 text-[10px] text-amber-300">{msg.warning}</div>}
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="p-3 rounded-lg bg-[#0c1017] border border-[#232d3f] text-xs text-slate-400 animate-pulse font-mono">
                      AI đang tra cứu tài liệu và đối soát nguồn...
                    </div>
                  )}
                </div>

                {/* Input Hỏi AI */}
                <div className="border-t border-[#232d3f] pt-3 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Hỏi lỗi Civil 3D, tọa độ GIS, InfraWorks..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAi()}
                    className="flex-1 px-3 py-1.5 text-xs bg-[#0c1017] border border-[#232d3f] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleSendAi}
                    disabled={isAiLoading || !aiPrompt.trim()}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ─── MODAL: SEARCH QUICK SWITCHER (Ctrl + K) ────────────────────────── */}
      {isSearchModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
          onClick={() => setIsSearchModalOpen(false)}
        >
          <div
            className="bg-[#131822] border border-[#2d3a4f] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="p-3.5 border-b border-[#232d3f] flex items-center space-x-3 bg-[#18202d]">
              <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                placeholder="Nhập từ khóa (vd: corridor, super elevation, navisworks, qgis, tọa độ...)"
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-sans"
              />
              <kbd
                onClick={() => setIsSearchModalOpen(false)}
                className="px-1.5 py-0.5 text-[10px] bg-[#0c1017] text-slate-400 border border-[#232d3f] rounded cursor-pointer hover:bg-slate-800 font-mono"
              >
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1 divide-y divide-[#1e293b]/50">
              {modalSearchQuery.trim() === '' ? (
                <div className="p-6 text-center text-xs text-slate-400 font-sans">
                  Gõ từ khóa để tra cứu siêu tốc trong toàn bộ 24 chương & 80 bài học thực hành...
                </div>
              ) : modalSearchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-rose-400 font-sans">
                  Không tìm thấy bài học nào với từ khóa “{modalSearchQuery}”.
                </div>
              ) : (
                modalSearchResults.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      setActiveLessonId(l.id);
                      setIsSearchModalOpen(false);
                    }}
                    className="p-3 rounded-lg hover:bg-[#18202d] cursor-pointer transition-colors flex items-start space-x-3"
                  >
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800 rounded mt-0.5">
                      {l.id.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-white mb-0.5">
                        {l.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {l.objective}
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-[10px] font-mono text-slate-500">
                        <span className="text-sky-400">{l.software}</span>
                        <span>•</span>
                        <span>Chương {l.chapterOrder}</span>
                        <span>•</span>
                        <span>{l.minutes} phút</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
