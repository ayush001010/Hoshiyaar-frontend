import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import reviewService from '../../../services/reviewService.js';
import curriculumService from '../../../services/curriculumService.js';
import { useReview } from '../../../context/ReviewContext.jsx';
import BackButton from '../../ui/BackButton.jsx';

export default function RevisionList() {
  const [params] = useSearchParams();
  const moduleId = params.get('moduleId') || '';
  const chapterId = params.get('chapterId') || '';
  const moduleTitleParam = params.get('moduleTitle') || '';
  const { user } = useAuth();
  const { reset, add } = useReview();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [chapterName, setChapterName] = useState('');
  const [moduleName, setModuleName] = useState(moduleTitleParam);
  const [chapters, setChapters] = useState([]);

  const EyeIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
      <circle cx="12" cy="12" r="2.5" fill="#fff"/>
    </svg>
  );
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      setLoading(true);
      let list = [];
      // Global subject-level view (no chapterId/moduleId)
      if (!moduleId && !chapterId) {
        try {
          const subj = user?.subject || 'Science';
          const brd = user?.board || 'CBSE';
          const chResp = await curriculumService.listChapters(brd, subj);
          setChapters(chResp?.data || []);
          setItems([]);
          setLoading(false);
          return;
        } catch (_) {
          setChapters([]);
          setLoading(false);
          return;
        }
      }
      // If chapter view, we need to know module IDs in this chapter and filter incorrect items by those
      if (!moduleId && chapterId) {
        try {
          const mods = await curriculumService.listModules(chapterId);
          const modArr = mods?.data || [];
          setModules(modArr);
          // Try to fetch chapter name (using same approach as dashboard)
          try {
            const chs = await curriculumService.listChapters('CBSE', user?.subject || 'Science');
            const chObj = (chs?.data || []).find(c => c._id === chapterId);
            if (chObj?.title) setChapterName(chObj.title);
          } catch (_) {}
          const allIncorrect = await reviewService.listIncorrect(user._id);
          const allowed = new Set(modArr.map(m => m._id));
          list = (allIncorrect || []).map(it => {
            if (!it.moduleId && it.questionId) {
              const [mod] = String(it.questionId).split('_');
              return { ...it, moduleId: mod };
            }
            return it;
          }).filter(it => allowed.has(it.moduleId));
        } catch (_) { list = []; }
      } else {
        list = await reviewService.listIncorrect(user._id, moduleId || undefined, chapterId || undefined);
      }
      setItems(list);
      // If a module is specified, fetch its items to show titles/questions
      if (moduleId) {
        try {
          const res = await curriculumService.listItems(moduleId);
          const arr = res?.data || [];
          // attach label
          setItems(list.map(it => {
            const [mod, idx] = String(it.questionId).split('_');
            const item = arr[Number(idx)] || {};
            const label = item.title || item.question || item.statement || `Question ${idx}`;
            return { ...it, label };
          }));
          const posibleName = arr[0]?.moduleTitle || arr[0]?.module || arr.moduleTitle;
          if (posibleName && !moduleTitleParam) setModuleName(posibleName);
        } catch (_) {}
        if (chapterId && !moduleTitleParam) {
          try {
            const mods = await curriculumService.listModules(chapterId);
            const modArr = mods?.data || [];
            const found = modArr.find(m => m._id === moduleId);
            if (found?.title) setModuleName(found.title);
          } catch (_) {}
        }
        // Fallback: scan chapters to find module title
        if (!moduleTitleParam && !moduleName) {
          try {
            const chs = await curriculumService.listChapters('CBSE', user?.subject || 'Science');
            const chapters = chs?.data || [];
            for (const ch of chapters) {
              try {
                const mods = await curriculumService.listModules(ch._id);
                const listMods = mods?.data || [];
                const fm = listMods.find(m => m._id === moduleId);
                if (fm?.title) { setModuleName(fm.title); break; }
              } catch (_) {}
            }
          } catch (_) {}
        }
      }
      setLoading(false);
    };
    load();
  }, [user, moduleId, chapterId]);

  const startReview = () => {
    reset();
    items.forEach(({ questionId }) => {
      const [mod, idx, type] = String(questionId).split('_');
      add({ questionId, moduleNumber: mod, index: idx, type: type || 'multiple-choice' });
    });
    if (items.length > 0) navigate('/review-round');
  };

  const subjectName = user?.subject || 'Science';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F2FF] to-white py-10 px-6 relative">
      <BackButton className="fixed left-4 top-4" />
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 tracking-wide">Let’s Fix What We Missed!</h1>
          <p className="mt-4 text-lg md:text-xl text-blue-900/80">{!chapterId && !moduleId ? 'Subject' : (moduleId ? 'Module' : 'Chapter')}:
            <span className="ml-2 px-3 py-1 rounded-2xl bg-blue-100 text-blue-800 font-bold">
              {!chapterId && !moduleId ? subjectName : (moduleId ? (moduleName || 'Loading…') : (chapterName || chapterId || 'All'))}
            </span>
          </p>
        </div>
      {loading ? (
        <div>Loading…</div>
      ) : (!moduleId && !chapterId) ? (
        // Subject-level index: show chapters (blue UI)
        (() => {
          if ((chapters || []).length === 0) return <div>No chapters found.</div>;
          return (
            <ul className="space-y-6">
              {chapters.map((ch) => (
                <li key={ch._id} className="w-full p-6 rounded-3xl border-4 border-blue-300 bg-white shadow-[0_10px_0_0_rgba(59,130,246,0.22)] flex items-center justify-between">
                  <div className="pr-4">
                    <div className="text-2xl font-extrabold text-blue-800">{ch.title}</div>
                    <div className="text-sm text-blue-900/70 mt-1">Chapter</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => navigate(`/revision?chapterId=${encodeURIComponent(ch._id)}`)} className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-base font-extrabold shadow-[0_6px_0_0_rgba(0,0,0,0.15)]">Open</button>
                  </div>
                </li>
              ))}
            </ul>
          );
        })()
      ) : !moduleId && chapterId ? (
        // Chapter-level index: show modules that have incorrect questions
        (() => {
          const stats = items.reduce((acc, it) => {
            if (!it.moduleId) return acc;
            const id = it.moduleId;
            const t = it.lastSeenAt ? new Date(it.lastSeenAt).getTime() : 0;
            if (!acc[id]) acc[id] = { count: 0, last: 0 };
            acc[id].count += 1;
            if (t > acc[id].last) acc[id].last = t;
            return acc;
          }, {});
          const list = Object.entries(stats);
          if (list.length === 0) return <div>No items to review.</div>;
          const titleFor = (id) => (modules.find(m => m._id === id)?.title) || id;
          return (
            <ul className="space-y-6">
              {list.map(([id, stat]) => (
                <li key={id} className="w-full p-6 rounded-3xl border-4 border-green-300 bg-white shadow-[0_10px_0_0_rgba(34,197,94,0.18)] flex items-center justify-between">
                  <div className="pr-4">
                    <div className="text-2xl font-extrabold text-green-700">{titleFor(id)}</div>
                    <div className="text-sm text-green-900/70 mt-1">Last attempt: {stat.last ? new Date(stat.last).toLocaleString() : '—'}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-sm inline-flex items-center gap-2">Attempted {stat.count}</span>
                    <button onClick={() => navigate(`/revision?moduleId=${encodeURIComponent(id)}&moduleTitle=${encodeURIComponent(titleFor(id))}`)} className="px-5 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-base font-extrabold shadow-[0_6px_0_0_rgba(0,0,0,0.15)]">Open</button>
                  </div>
                </li>
              ))}
            </ul>
          );
        })()
      ) : items.length === 0 ? (
        <div>No items to review.</div>
      ) : (
        <>
          <ul className="space-y-4 mb-10">
            {items.map((it, i) => (
              <li key={i} className="p-6 rounded-3xl bg-white border-4 border-blue-300 shadow-[0_10px_0_0_rgba(59,130,246,0.22)] flex items-center justify-between">
                <div className="flex flex-col pr-4">
                  <span className="text-xl font-extrabold text-blue-800">{it.label || it.questionId}</span>
                  <span className="text-xs text-gray-500">Last seen: {it.lastSeenAt ? new Date(it.lastSeenAt).toLocaleString() : '—'}</span>
                </div>
                <span className="text-sm text-gray-700 inline-flex items-center gap-2">Attempted {it.count}</span>
              </li>
            ))}
          </ul>
          <div className="text-center">
            <button onClick={startReview} className="px-10 py-4 rounded-3xl bg-green-600 hover:bg-green-700 text-white text-2xl font-extrabold shadow-[0_10px_0_0_rgba(0,0,0,0.15)]">Start Re-attempt</button>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
