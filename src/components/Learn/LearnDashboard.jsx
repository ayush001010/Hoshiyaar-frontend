import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import heroChar from '../../Images/heroChar.png';

// --- SVG Icons for the Dashboard ---
const LearnIcon = () => <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 2v5l-1-.75L15 9V4h2zm-3 0v5l-1-.75L12 9V4h2zm-3 0v5l-1-.75L9 9V4h2z"></path></svg>;
const ReviseIcon = () => <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 10c-2.48 0-4.5-2.02-4.5-4.5S9.52 5.5 12 5.5 16.5 7.52 16.5 10 14.48 14.5 12 14.5z"></path></svg>;
const ProfileIcon = () => <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>;
const StarIcon = () => <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>;
const BookIcon = () => <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"></path></svg>;
const ChapterNavIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>;

// Cute bouncing "START" badge used above the active node
const StartBadge = () => (
  <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 select-none">
    <div className="relative">
      <div className="px-3 py-1.5 rounded-xl bg-transparent text-blue-500 font-extrabold tracking-wider shadow-none ring-2 ring-blue-500 animate-bounce bg-white/0">
        START
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-6 border-r-6 border-t-8 border-l-transparent border-r-transparent border-t-blue-500"></div>
    </div>
  </div>
);

const PathNode = ({ status, onClick, disabled, offset = 0 }) => {
  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const iconColor = isCompleted ? 'text-white' : isActive ? 'text-white' : 'text-white';
  const nodeBg = isCompleted ? 'bg-yellow-400' : isActive ? 'bg-blue-500' : 'bg-gray-300';
  const size = isActive ? 'w-24 h-24 md:w-24 md:h-24' : 'w-20 h-20 md:w-20 md:h-20';
  return (
    <div className="inline-flex items-center justify-center" style={{ transform: `translateX(${offset}px)` }}>
      <div
        onClick={disabled ? undefined : onClick}
        className={`${size} rounded-full flex items-center justify-center shadow-[0_8px_0_0_rgba(0,0,0,0.15)] ${nodeBg} ${iconColor} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110 transition-transform'}`}
      >
                    <StarIcon />
                </div>
            </div>
        );
};

const LearnDashboard = ({ onboardingData }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [chapterTitle, setChapterTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [modulesList, setModulesList] = useState([]); // fetched modules for this chapter
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const subjectName = 'Science';

  useEffect(() => {
    const load = async () => {
      try {
        if (user?._id) {
          const svc = (await import('../../services/authService.js')).default;
          const res = await svc.getProgress(user._id);
          setProgress(res.data || []);
        }
        // Load chapter & module titles from curriculum API
        const cur = (await import('../../services/curriculumService.js')).default;
        const chaptersResp = await cur.listChapters('CBSE', subjectName);
        const ch = chaptersResp?.data?.[0];
        if (ch) {
          setChapterTitle(ch.title);
          const modules = await cur.listModules(ch._id);
          const list = modules?.data || [];
          setModulesList(list);
          if (list[0]) setModuleTitle(list[0].title);
        }
      } catch (e) {}
    };
    load();
  }, [user]);

  const handleLogout = () => {
    try { localStorage.removeItem('learnOnboarded'); } catch (_) {}
    logout?.();
    try { window.location.href = '/'; } catch (_) {}
  };

  const levels = modulesList.length > 0 ? modulesList : [ {}, {}, {}, {} ];
  const firstIncompleteIndex = levels.findIndex((_, i) => {
    const ch = progress.find(p => p.chapter === i + 1);
    return !(ch && ch.conceptCompleted);
  });

  const amplitude = 30;

    return (
    <div className="bg-[#E5F0FE] h-screen flex flex-col md:flex-row overflow-hidden">
            {/* Left Sidebar */}
      <nav className="w-full md:w-64 p-6 space-y-4 border-b md:border-b-0 md:border-r border-blue-200 flex flex-row md:flex-col justify-around md:justify-start shrink-0 bg-white shadow-lg">
        <h1 className="hidden md:block text-3xl font-extrabold text-blue-600 mb-6">HoshiYaar</h1>
        <a href="#" className={`flex items-center gap-4 py-3 px-4 rounded-xl text-lg font-bold transition-colors bg-blue-500 text-white shadow-md`}><LearnIcon /><span>Learn</span></a>
        <a href="#" className={`flex items-center gap-4 py-3 px-4 rounded-xl text-lg font-bold transition-colors text-gray-600 hover:bg-blue-50`}><ReviseIcon /><span>Revision</span></a>
        <a href="#" className={`flex items-center gap-4 py-3 px-4 rounded-xl text-lg font-bold transition-colors text-gray-600 hover:bg-blue-50`}><ProfileIcon /><span>Profile</span></a>
        {/* Logout pinned to bottom on desktop */}
        <div className="hidden md:block mt-auto pt-4">
          <button onClick={handleLogout} className="w-full py-3 px-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">Logout</button>
        </div>
            </nav>

      <main className="flex-grow p-3 md:p-6 overflow-hidden bg-[#E5F0FE]">

        {/* Section Header */}
        <div className="bg-blue-500 text-white px-6 py-5 rounded-2xl flex justify-between items-center mb-6 shadow-[0_10px_0_0_rgba(0,0,0,0.15)] max-w-3xl mx-auto">
                        <div>
            <p className="font-extrabold text-2xl md:text-3xl">
              Science
            </p>
            <p className="opacity-90 text-lg md:text-xl">{chapterTitle || 'Unit 1'}</p>
                        </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-3 py-3 px-5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors ring-1 ring-white/30 text-lg">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/20"><ChapterNavIcon /></span>
                        <span className="font-bold hidden sm:inline">Other Chap</span>
                    </button>
          </div>
                </div>
                
        {/* Vertical timeline */}
        <div className="relative max-w-4xl mx-auto h-[75vh] overflow-y-auto no-scrollbar">
          {/* Center line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-20 bottom-0 w-3 bg-blue-200 rounded-full z-20" />
          <div className="relative flex flex-col items-center gap-24 pt-28 pb-8">
            {levels.map((mod, index) => {
              const p = progress.find(c => c.chapter === index + 1);
              let status = 'locked';
              if (p && p.conceptCompleted) status = 'completed';
              else if (index === 0) status = 'active';
              const canClick = true; // allow opening any module; adjust when per-module progress exists
              const alignRight = index % 2 === 1;
              return (
                <div
                  key={index}
                  className="relative w-full flex items-center justify-center"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Connector + Star Node (alternate left/right) */}
                  {alignRight ? (
                    <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-1/2">
                      <div className="flex items-center">
                        <div className="h-2 md:h-3 bg-blue-300 w-28 md:w-36"></div>
                        <div className="relative">
                          {status === 'active' && <StartBadge />}
                          <PathNode
                            status={status}
                            disabled={!canClick}
                            onClick={() => {
                              if (!canClick) return;
                              const moduleId = modulesList[index]?._id;
                              if (moduleId) navigate(`/learn/module/${moduleId}`);
                            }}
                          />
                        </div>
                        </div>
                    </div>
                  ) : (
                    <div className="absolute right-1/2 top-1/2 -translate-y-1/2 w-1/2">
                      <div className="flex items-center justify-end">
                        <div className="relative">
                          {status === 'active' && <StartBadge />}
                          <PathNode
                            status={status}
                            disabled={!canClick}
                            onClick={() => {
                              if (!canClick) return;
                              const moduleId = modulesList[index]?._id;
                              if (moduleId) navigate(`/learn/module/${moduleId}`);
                            }}
                          />
                        </div>
                        <div className="h-2 md:h-3 bg-blue-300 w-28 md:w-36"></div>
                      </div>
                    </div>
                  )}
                  {/* Tooltip (hover only with smooth transition) */}
                  <div
                    className={`absolute ${alignRight ? 'left-[60%]' : 'right-[60%]'} top-1/2 -translate-y-1/2 bg-white border-4 border-gray-900 rounded-[24px] shadow-xl px-7 py-5 w-80 hidden md:block transition-all duration-300 ${
                      hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="text-2xl font-extrabold">Subject: {subjectName}</div>
                    <div className="text-xl">Lesson {index + 1} of {levels.length}</div>
                    <div className="text-xl font-semibold mt-1">Module: {(modulesList[index]?.title) || moduleTitle || 'Module'}</div>
                  </div>
                </div>
              );
            })}
          </div>
                </div>
            </main>

      {/* Right Panel with Character */}
      <aside className="hidden lg:flex w-80 p-6 items-center justify-center shrink-0 bg-[#E5F0FE] h-full">
        <div className="w-full flex items-center justify-center">
          <img src={heroChar} alt="Hoshi" className="w-56 h-56 object-contain" />
                </div>
            </aside>
        </div>
    );
};

export default LearnDashboard;

