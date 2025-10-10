import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import heroChar from "../../../assets/images/heroChar.png";
import RevisionStar from "../quiz/RevisionStar.jsx";
import { ReviewProvider } from "../../../context/ReviewContext.jsx";
import chapterImg from "../../../assets/images/chapterImg.png";

// --- SVG Icons for the Dashboard ---
const LearnIcon = () => (
  <svg
    className="w-7 h-7 md:w-8 md:h-8"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 2v5l-1-.75L15 9V4h2zm-3 0v5l-1-.75L12 9V4h2zm-3 0v5l-1-.75L9 9V4h2z"></path>
  </svg>
);
const ReviseIcon = () => (
  <svg
    className="w-7 h-7 md:w-8 md:h-8"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 10c-2.48 0-4.5-2.02-4.5-4.5S9.52 5.5 12 5.5 16.5 7.52 16.5 10 14.48 14.5 12 14.5z"></path>
  </svg>
);
const ProfileIcon = () => (
  <svg
    className="w-7 h-7 md:w-8 md:h-8"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
  </svg>
);
const StarIcon = () => (
  <svg
    className="w-8 h-8 md:w-10 md:h-10"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
  </svg>
);
const BookIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"></path>
  </svg>
);
const ChapterNavIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
  </svg>
);

// Cute bouncing "START" badge used above the active node
const StartBadge = ({ color = "#2C6DEF" }) => (
  <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 select-none">
    <div className="relative">
      <div
        className="px-3 py-1.5 rounded-xl font-extrabold tracking-wider shadow-none animate-bounce"
        style={{
          color: color,
          background: "transparent",
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: color,
        }}
      >
        START
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-6 border-r-6 border-t-8 border-l-transparent border-r-transparent"
        style={{ borderTopColor: color }}
      ></div>
    </div>
  </div>
);

const PathNode = ({ status, onClick, disabled, offset = 0, color = "#2C6DEF", lightenFn, darkenFn }) => {
  const isCompleted = status === "completed";
  const isActive = status === "active";
  const iconColor = "text-white";
  const activeFrom = color;
  const activeTo = darkenFn ? darkenFn(color, 0.15) : color;
  const lockedFrom = lightenFn ? lightenFn(color, 0.55) : color;
  const lockedTo = lightenFn ? lightenFn(color, 0.35) : color;
  const nodeStyle = isCompleted
    ? { background: "linear-gradient(135deg, #FACC15, #EAB308)" }
    : isActive
    ? { background: `linear-gradient(135deg, ${activeFrom}, ${activeTo})`, animation: "pulse 2s infinite" }
    : { background: `linear-gradient(135deg, ${lockedFrom}, ${lockedTo})` };
  const size = isActive
    ? "w-24 h-24 md:w-24 md:h-24"
    : "w-20 h-20 md:w-20 md:h-20";
  return (
    <div
      className="inline-flex items-center justify-center"
      style={{ transform: `translateX(${offset}px)` }}
    >
      <div
        onClick={disabled ? undefined : onClick}
        className={`${size} rounded-full flex items-center justify-center shadow-[0_8px_0_0_rgba(0,0,0,0.15)] ${iconColor} ring-4 ring-white/70 ${
          disabled
            ? "cursor-not-allowed"
            : "cursor-pointer hover:scale-110 transition-transform"
        }`}
        style={nodeStyle}
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
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [chaptersList, setChaptersList] = useState([]);
  const [moduleTitle, setModuleTitle] = useState("");
  const [modulesList, setModulesList] = useState([]); // fetched modules for this chapter
  const [unitTitle, setUnitTitle] = useState("");
  const [unitsList, setUnitsList] = useState([]);
  const [unitModulesMap, setUnitModulesMap] = useState({}); // { unitId: Module[] }
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showChapters, setShowChapters] = useState(false);
  const [chapterStats, setChapterStats] = useState({}); // { [chapterId]: { total, completed } }
  const tips = [
    "Short lessons win! Finish one star, then take a mini break.",
    "Try to explain the concept to a friend or toy. Teaching helps!",
    "Stuck? Rewatch once and try again. Practice makes progress!",
    "Earn more stars to unlock revision power-ups.",
  ];
  const [tipIndex, setTipIndex] = useState(0);
  const [tipHidden, setTipHidden] = useState(false);
  const [streak, setStreak] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Palette for per-unit theming
  const unitPalette = ["#2C6DEF", "#58CC02", "#CE82FF", "#00CD9C"];
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const hexToRgb = (hex) => {
    const h = hex.replace('#','');
    const bigint = parseInt(h.length === 3 ? h.split('').map((c)=>c+c).join('') : h, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  };
  const rgbToHex = ({r,g,b}) => {
    const toHex = (v) => v.toString(16).padStart(2,'0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };
  const lighten = (hex, amount = 0.25) => {
    const { r, g, b } = hexToRgb(hex);
    const rr = clamp(Math.round(r + (255 - r) * amount), 0, 255);
    const gg = clamp(Math.round(g + (255 - g) * amount), 0, 255);
    const bb = clamp(Math.round(b + (255 - b) * amount), 0, 255);
    return rgbToHex({ r: rr, g: gg, b: bb });
  };
  const darken = (hex, amount = 0.15) => {
    const { r, g, b } = hexToRgb(hex);
    const rr = clamp(Math.round(r * (1 - amount)), 0, 255);
    const gg = clamp(Math.round(g * (1 - amount)), 0, 255);
    const bb = clamp(Math.round(b * (1 - amount)), 0, 255);
    return rgbToHex({ r: rr, g: gg, b: bb });
  };
  const withAlpha = (hex, alpha = 0.6) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Helpers: local persistence for lesson completion
  const userScopedKey = (base) => `${base}__${user?._id || 'anon'}`;
  const LS_KEY_BASE = "lesson_progress_v1";
  const LS_IDS_KEY_BASE = "lesson_completed_ids_v1";
  const LS_KEY = userScopedKey(LS_KEY_BASE);
  const USE_LOCAL_PROGRESS = false; // set true to enable client-side caching
  const loadLocalProgress = () => {
    if (!USE_LOCAL_PROGRESS) return {};
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  };
  const saveLocalProgress = (data) => {
    if (!USE_LOCAL_PROGRESS) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch (_) {}
  };
  const markIndexCompletedLocal = (unitId, index) => {
    if (!USE_LOCAL_PROGRESS) return;
    const store = loadLocalProgress();
    const key = unitId || "default";
    const set = new Set(store[key] || []);
    set.add(index);
    store[key] = Array.from(set);
    saveLocalProgress(store);
  };
  // Track completion by moduleId as well for robustness across ordering
  const LS_IDS_KEY = userScopedKey(LS_IDS_KEY_BASE);
  const loadCompletedIds = () => {
    if (!USE_LOCAL_PROGRESS) return new Set();
    try {
      const raw = localStorage.getItem(LS_IDS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(arr);
    } catch (_) {
      return new Set();
    }
  };
  const addCompletedId = (moduleId) => {
    if (!USE_LOCAL_PROGRESS) return;
    try {
      const set = loadCompletedIds();
      if (moduleId) set.add(String(moduleId));
      localStorage.setItem(LS_IDS_KEY, JSON.stringify(Array.from(set)));
    } catch (_) {}
  };

  // Pull subject/board from user or onboardingData
  const selectedBoard = onboardingData?.board || user?.board || "CBSE";
  const subjectName = onboardingData?.subject || user?.subject || "Science";
  const preferredChapterId = onboardingData?.chapter || user?.chapter || null;

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        if (user?._id) {
          const svc = (await import("../../../services/authService.js")).default;
          const res = await svc.getProgress(user._id);
          setProgress(res.data || []);
          // mirror server progress into local storage as indexes by chapter (1-based)
          if (USE_LOCAL_PROGRESS) {
            try {
              const local = loadLocalProgress();
              const completedIdx = (res.data || [])
                .filter((p) => p?.conceptCompleted)
                .map((p) => (p?.chapter ? p.chapter - 1 : null))
                .filter((n) => Number.isInteger(n));
              const key = "default";
              const set = new Set([...(local[key] || []), ...completedIdx]);
              local[key] = Array.from(set);
              saveLocalProgress(local);
            } catch (_) {}
          }
        }
        // Load chapter & module titles from curriculum API using user selections
        const cur = (await import("../../../services/curriculumService.js"))
          .default;
        const chaptersResp = await cur.listChapters(selectedBoard, subjectName);
        const listCh = chaptersResp?.data || [];
        setChaptersList(listCh);
        const params = new URLSearchParams(window.location.search);
        const preferId = params.get("chapterId") || preferredChapterId;
        const ch = preferId
          ? listCh.find((c) => c._id === preferId)
          : listCh[0];
        if (ch) {
          setChapterTitle(ch.title);
          setChapterId(ch._id);
          // Resolve unit title (prefer last opened unit for this chapter)
          try {
            const unitsResp = await cur.listUnits(ch._id);
            const units = unitsResp?.data || [];
            setUnitsList(units);
            // Fetch modules for ALL units to enable stacked timelines
            const nextMap = {};
            for (const u of units) {
              try {
                const mods = await cur.listModulesByUnit(u._id);
                nextMap[u._id] = mods?.data || [];
              } catch (_) {
                nextMap[u._id] = [];
              }
            }
            setUnitModulesMap(nextMap);
            let lastMap = {};
            try {
              lastMap = JSON.parse(
                localStorage.getItem("last_unit_by_chapter") || "{}"
              );
            } catch (_) {
              lastMap = {};
            }
            const preferredUnitId =
              new URLSearchParams(window.location.search).get("unitId") ||
              lastMap?.[ch._id];
            const preferredUnit = units.find((u) => u?._id === preferredUnitId);
            const chosenUnit = preferredUnit || units[0];
            if (chosenUnit?.title) setUnitTitle(chosenUnit.title);
            // Load modules for chosen unit if available; otherwise fallback to chapter modules
            if (chosenUnit?._id) {
              const modsByUnit = await cur.listModulesByUnit(chosenUnit._id);
              const list = modsByUnit?.data || [];
              setModulesList(list);
              if (list[0]) setModuleTitle(list[0].title);
            } else {
              const modules = await cur.listModules(ch._id);
              const list = modules?.data || [];
              setModulesList(list);
              if (list[0]) setModuleTitle(list[0].title);
            }
          } catch (_) {
            setUnitTitle("");
            const modules = await cur.listModules(ch._id);
            const list = modules?.data || [];
            setModulesList(list);
            if (list[0]) setModuleTitle(list[0].title);
          }
        }
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user, selectedBoard, subjectName, preferredChapterId]);

  // When opening chapters grid, load per-chapter module counts and compute simple completion
  useEffect(() => {
    if (!showChapters || chaptersList.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const cur = (await import("../../../services/curriculumService.js"))
          .default;
        const nextStats = {};
        for (let i = 0; i < chaptersList.length; i++) {
          const ch = chaptersList[i];
          try {
            const mods = await cur.listModules(ch._id);
            const total = (mods?.data || []).length || 0;
            // Approximate completed using progress entries with chapter index
            const completed = (progress || []).filter(
              (p) => p?.chapter === i + 1 && p?.conceptCompleted
            ).length;
            nextStats[ch._id] = { total, completed };
          } catch (_) {
            nextStats[ch._id] = { total: 0, completed: 0 };
          }
          if (cancelled) return;
        }
        if (!cancelled) setChapterStats(nextStats);
      } catch (_) {}
    })();
    return () => {
      cancelled = true;
    };
  }, [showChapters, chaptersList, progress]);

  // Rotate tips every 5 seconds
  useEffect(() => {
    if (tipHidden) return;
    const id = setInterval(
      () => setTipIndex((i) => (i + 1) % tips.length),
      5000
    );
    return () => clearInterval(id);
  }, [tipHidden]);

  // Daily streak: auto-increment on first visit of the day
  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const storedDay = localStorage.getItem("daily_streak_day");
      let count = Number(localStorage.getItem("daily_streak_count")) || 0;
      if (!storedDay) {
        count = Math.max(1, count);
        localStorage.setItem("daily_streak_count", String(count));
        localStorage.setItem("daily_streak_day", today);
      } else if (storedDay !== today) {
        count = count + 1;
        localStorage.setItem("daily_streak_count", String(count));
        localStorage.setItem("daily_streak_day", today);
        setShowConfetti(true);
        try {
          setTimeout(() => setShowConfetti(false), 1500);
        } catch (_) {}
      }
      setStreak(count || 1);
    } catch (_) {}
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("learnOnboarded");
      // Clear user-scoped cached progress on logout
      if (USE_LOCAL_PROGRESS) {
        try {
          localStorage.removeItem(userScopedKey(LS_KEY_BASE));
          localStorage.removeItem(userScopedKey(LS_IDS_KEY_BASE));
        } catch (_) {}
      }
    } catch (_) {}
    logout?.();
    try {
      window.location.href = "/";
    } catch (_) {}
  };

  const levels = modulesList;
  const serverCompletedSet = new Set(
    (progress || [])
      .filter((p) => p?.conceptCompleted)
      .map((p) => (p?.chapter ? p.chapter - 1 : -1))
      .filter((i) => i >= 0)
  );
  const localProgress = loadLocalProgress();
  const completedIdSet = loadCompletedIds();

  // Note: firstIncompleteIndex will be computed per unit to reflect local/module-id completion
  const firstIncompleteIndex = levels.findIndex((_, i) => !serverCompletedSet.has(i));

  const amplitude = 30;
  const nodesCount = levels.length + 1; // modules + revision node
  const rowSpacing = 160; // px per row (approx based on gap and node size)
  const centerTopOffset = 80; // equals top-20
  const listHeight = nodesCount * rowSpacing;
  const lineHeight = Math.max(200, levels.length * rowSpacing - 120);

  return (
    <ReviewProvider>
      <div className="bg-gradient-to-b from-[#E6F2FF] to-[#F7FBFF] h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar */}
        <nav className="w-full md:w-64 p-6 space-y-4 border-b md:border-b-0 md:border-r border-blue-200 flex flex-row md:flex-col justify-around md:justify-start shrink-0 bg-white shadow-lg">
          <h1 className="hidden md:block text-3xl font-extrabold text-blue-600 mb-6">
            HoshiYaar
          </h1>
          <a
            href="#"
            className={`flex items-center gap-4 py-3 px-4 rounded-xl text-lg font-bold transition-colors bg-blue-500 text-white shadow-md`}
          >
            <LearnIcon />
            <span>Learn</span>
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/revision");
            }}
            className={`flex items-center gap-4 py-3 px-4 rounded-xl text-lg font-bold transition-colors text-gray-600 hover:bg-blue-50`}
          >
            <ReviseIcon />
            <span>Revision</span>
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/profile");
            }}
            className={`flex items-center gap-4 py-3 px-4 rounded-xl text-lg font-bold transition-colors text-gray-600 hover:bg-blue-50`}
          >
            <ProfileIcon />
            <span>Profile</span>
          </a>
          {/* Logout removed from dashboard */}
        </nav>

        <main className="flex-grow p-3 md:p-6 overflow-auto no-scrollbar bg-transparent">
          {/* Section Header (hide when viewing chapters list). If units exist, headers are shown per unit below, so hide this top one. */}
          

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-blue-600 font-semibold text-lg">
                  Loading your learning path...
                </p>
              </div>
            </div>
          )}

          {/* Vertical timelines - stacked per unit (scroll to view more) */}
          {!isLoading && (
            <div
              className={`${
                showChapters ? "relative w-full" : "relative max-w-4xl"
              } mx-auto h-[80vh] overflow-y-auto no-scrollbar`}
            >
              {showChapters ? (
                <div className="w-full px-4 md:px-8">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-3xl p-6 md:p-8 shadow-[0_10px_0_0_rgba(0,0,0,0.15)] ring-4 ring-white/20 w-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xl font-extrabold opacity-95">
                        SEE DETAILS
                      </div>
                      <button
                        onClick={() => setShowChapters(false)}
                        className="text-white/90 hover:text-white text-2xl"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-6 max-h-[60vh] overflow-y-auto pr-1">
                      {chaptersList.map((ch) => (
                        <div
                          key={ch._id}
                          className="w-full min-h-[240px] md:min-h-[260px] rounded-2xl p-6 md:p-8 bg-white text-blue-700 border-4 border-blue-200 shadow-[0_10px_0_0_rgba(0,0,0,0.10)] flex items-center gap-8"
                        >
                          <div className="flex-1">
                            <div className="text-2xl font-extrabold">
                              {ch.title}
                            </div>
                            <div className="mt-3 h-3 bg-blue-100 rounded-full overflow-hidden">
                              {(() => {
                                const st = chapterStats[ch._id] || {
                                  total: 0,
                                  completed: 0,
                                };
                                const pct =
                                  st.total > 0
                                    ? Math.min(
                                        100,
                                        Math.round(
                                          (st.completed / st.total) * 100
                                        )
                                      )
                                    : 0;
                                return (
                                  <div
                                    className="h-full bg-blue-400"
                                    style={{ width: `${pct}%` }}
                                  />
                                );
                              })()}
                            </div>
                            <div className="mt-1 text-xs text-blue-700/80 font-extrabold">
                              {(() => {
                                const st = chapterStats[ch._id] || {
                                  total: 0,
                                  completed: 0,
                                };
                                return `${st.completed} / ${st.total || "?"}`;
                              })()}
                            </div>
                            <div className="mt-5">
                              <button
                                onClick={() => {
                                  setShowChapters(false);
                                  window.location.href = `/learn?chapterId=${encodeURIComponent(
                                    ch._id
                                  )}`;
                                }}
                                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg shadow-[0_8px_0_0_rgba(0,0,0,0.12)]"
                              >
                                CONTINUE
                              </button>
                            </div>
                          </div>
                          {/* Chapter illustration (right side) */}
                          <div className="flex-shrink-0 pr-2">
                            <img
                              src={chapterImg}
                              alt="Chapter"
                              className="w-46 h-46 md:w-52 md:h-52 object-contain opacity-95"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Center line (dynamic height) */}
                  {/* Render each unit block one after another */}
                  {(unitsList.length
                    ? unitsList
                    : [{ _id: "default", title: unitTitle }]
                  ).map((u, unitIdx) => {
                    const unitMods = unitModulesMap[u._id] || modulesList;
                    const localLevels = unitMods;
                    // Make the center line span from the first star to the revision star
                    // Start line a bit below the unit header and stop slightly above the next header
                    const localLineHeight = Math.max(
                      120,
                      (localLevels.length - 1) * rowSpacing + 100
                    );
                    return (
                      <div
                        key={u._id || unitIdx}
                        className="relative pt-12 pb-28"
                      >
                         {/* Unit header card - sticky until next unit */}
                         {(() => { const color = unitPalette[unitIdx % unitPalette.length]; const gradFrom = color; const gradTo = darken(color, 0.15); return (
                         <div className="sticky top-0 z-30 text-white px-6 py-5 rounded-3xl flex justify-between items-center mb-8 shadow-[0_10px_0_0_rgba(0,0,0,0.15)] max-w-3xl mx-auto border-4"
                              style={{ background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`, borderColor: withAlpha(color, 0.25) }}>
                           <div>
                             <p className="font-extrabold text-xl md:text-2xl">
                               {u.title || unitTitle || `Unit ${unitIdx + 1}`}
                             </p>
                             {chapterTitle && (
                               <p className="opacity-95 text-base md:text-lg">
                                 {chapterTitle}
                               </p>
                             )}
                             <p className="opacity-90 text-sm md:text-base">
                               {subjectName}
                             </p>
                           </div>
                           <div className="flex items-center gap-2">
                             <button 
                               onClick={() => setShowChapters(true)} 
                               className="flex items-center gap-3 py-3 px-5 rounded-2xl bg-white/15 hover:bg-white/25 transition-colors ring-2 ring-white/40 text-lg"
                             >
                               <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
                                 <ChapterNavIcon />
                               </span>
                               <span className="font-bold hidden sm:inline">All Chapters</span>
                             </button>
                           </div>
                         </div>
                         ); })()}
                        {/* Center line for this unit */}
                        {(() => { const color = unitPalette[unitIdx % unitPalette.length]; return (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 w-3 rounded-full z-20 shadow-[0_0_0_6px_rgba(255,255,255,0.5)]"
                          style={{ top: 240, height: localLineHeight, backgroundColor: lighten(color, 0.5) }}
                        /> ); })()}
                        <div className="relative flex flex-col items-center gap-24 pt-28 pb-8">
                          {localLevels.map((mod, index) => {
                            const p = progress.find((c) => c.chapter === index + 1);
                            const moduleIdHere = unitMods[index]?._id;
                            const localDoneByIndex = (localProgress[u?._id] || localProgress["default"] || []).includes(index);
                            const localDoneById = moduleIdHere ? completedIdSet.has(String(moduleIdHere)) : false;
                            // Compute per-unit first incomplete using module IDs
                            const firstIncompleteForUnit = (() => {
                              for (let i = 0; i < unitMods.length; i++) {
                                const id = unitMods[i]?._id;
                                const idxDone = (localProgress[u?._id] || localProgress["default"] || []).includes(i);
                                const idDone = id ? completedIdSet.has(String(id)) : false;
                                const serverDone = progress.find((c) => c.chapter === i + 1 && c.conceptCompleted);
                                if (!(idxDone || idDone || serverDone)) return i;
                              }
                              return -1; // all completed -> no active star in this unit
                            })();
                            let status = "locked";
                            if ((p && p.conceptCompleted) || localDoneByIndex || localDoneById) status = "completed";
                            else if (index === firstIncompleteForUnit) status = "active";
                            const canClick = true; // allow opening any module; adjust when per-module progress exists
                            const alignRight = index % 2 === 1;
                            const railColor = lighten(unitPalette[unitIdx % unitPalette.length], 0.45);
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
                                      <div className="h-2 md:h-3 w-28 md:w-36 rounded-full" style={{ backgroundColor: railColor }}></div>
                                      <div className="relative">
                                        {status === "active" && <StartBadge color={unitPalette[unitIdx % unitPalette.length]} />}
                                        <PathNode
                                          status={status}
                                          disabled={!canClick}
                                          color={unitPalette[unitIdx % unitPalette.length]}
                                          lightenFn={lighten}
                                          darkenFn={darken}
                                          onClick={() => {
                                            if (!canClick) return;
                                            const moduleId = modulesList[index]?._id;
                                            if (moduleId) navigate(`/learn/module/${moduleId}`);
                                            // optimistically mark active as completed locally (can be adjusted when real completion event fires)
                                            if (status === "active") {
                                              markIndexCompletedLocal(u?._id, index);
                                              addCompletedId(moduleId);
                                            }
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="absolute right-1/2 top-1/2 -translate-y-1/2 w-1/2">
                                    <div className="flex items-center justify-end">
                                      <div className="relative">
                                        {status === "active" && <StartBadge color={unitPalette[unitIdx % unitPalette.length]} />}
                                        <PathNode
                                          status={status}
                                          disabled={!canClick}
                                          color={unitPalette[unitIdx % unitPalette.length]}
                                          lightenFn={lighten}
                                          darkenFn={darken}
                                          onClick={() => {
                                            if (!canClick) return;
                                            const moduleId = unitMods[index]?._id;
                                            if (moduleId) navigate(`/learn/module/${moduleId}`);
                                            if (status === "active") {
                                              markIndexCompletedLocal(u?._id, index);
                                              addCompletedId(moduleId);
                                            }
                                          }}
                                        />
                                      </div>
                                      <div className="h-2 md:h-3 w-28 md:w-36 rounded-full" style={{ backgroundColor: railColor }}></div>
                                    </div>
                                  </div>
                                )}
                                {/* Tooltip (hover only with smooth transition) - placed below the star */}
                                <div
                                  className={`absolute ${alignRight ? "left-[62%]" : "right-[62%]"} top-full mt-4 bg-white border-4 border-blue-600 rounded-[24px] shadow-xl px-7 py-5 w-80 hidden md:block transition-all duration-500 ease-out ${
                                    hoveredIndex === index ? "opacity-100" : "opacity-0 pointer-events-none"
                                  }`}
                                  style={{ zIndex: 40 }}
                                >
                                  <div className="text-2xl font-extrabold mt-1 text-blue-700">
                                    {unitMods[index]?.title ||
                                      moduleTitle ||
                                      "—"}
                                  </div>
                                  <div className="text-xl font-semibold text-blue-700/80">
                                    {u.title || unitTitle || "—"}
                                  </div>
                                  <div className="text-base font-medium text-blue-700/60">
                                    {chapterTitle || "—"}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {/* Revision star below modules, connected to center line and on alternate side of last module */}
                          {(() => {
                            const lastIndex = Math.max(0, localLevels.length - 1);
                            const lastAlignRight = lastIndex % 2 === 1; // true if last node is on the right
                            const starAlignRight = !lastAlignRight; // place revision star opposite the last node
                            const railColor = lighten(unitPalette[unitIdx % unitPalette.length], 0.55);
                            return (
                              <div className="relative w-full h-28">
                                {starAlignRight ? (
                                  <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-1/2 flex items-center">
                                    <div
                                      className="h-2 md:h-3 rounded-full"
                                      style={{ width: `calc(50% - 90px)`, backgroundColor: railColor, opacity: 0.8 }}
                                    ></div>
                                    <RevisionStar
                                      align="right"
                                      chapterId={chapterId}
                                      unitId={u?._id}
                                    />
                                  </div>
                                ) : (
                                  <div className="absolute right-1/2 top-1/2 -translate-y-1/2 w-1/2 flex items-center justify-end">
                                    <RevisionStar
                                      align="left"
                                      chapterId={chapterId}
                                      unitId={u?._id}
                                    />
                                    <div
                                      className="h-2 md:h-3 rounded-full"
                                      style={{ width: `calc(50% - 90px)`, backgroundColor: railColor, opacity: 0.8 }}
                                    ></div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* No Data State */}
          {!isLoading &&
            !showChapters &&
            unitsList.length === 0 &&
            modulesList.length === 0 && (
              <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-blue-600 font-semibold text-lg mb-2">
                    No content available
                  </p>
                  <p className="text-gray-600">
                    Please check your selections or try refreshing the page.
                  </p>
                </div>
              </div>
            )}
        </main>

        {/* Right Panel with Character */}
        <aside className="hidden lg:flex w-80 p-6 items-center justify-center shrink-0 bg-transparent h-full relative">
          {/* Confetti burst when streak increases */}
          {showConfetti && (
            <div className="pointer-events-none absolute top-0 right-0 w-36 h-36">
              <div
                className="absolute text-2xl animate-bounce"
                style={{ top: 8, right: 8 }}
              >
                🎉
              </div>
              <div
                className="absolute text-2xl animate-bounce"
                style={{ top: 30, right: 48, animationDelay: "0.15s" }}
              >
                ✨
              </div>
              <div
                className="absolute text-2xl animate-bounce"
                style={{ top: 12, right: 72, animationDelay: "0.3s" }}
              >
                🎊
              </div>
              <div
                className="absolute text-2xl animate-bounce"
                style={{ top: 52, right: 20, animationDelay: "0.45s" }}
              >
                ⭐
              </div>
            </div>
          )}
          <div className="w-full flex items-center justify-center">
            <img
              src={heroChar}
              alt="Hoshi"
              className="w-64 h-64 lg:w-72 lg:h-72 object-contain"
            />
          </div>
          {/* Streak + Continue card */}
          <div className="absolute top-6 right-4 w-[88%] bg-white border-4 border-blue-300 rounded-2xl px-4 py-3 shadow-[0_8px_0_0_rgba(0,0,0,0.10)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <div>
                  <div className="text-xs font-extrabold text-blue-700">
                    Daily streak
                  </div>
                  <div className="text-lg font-extrabold text-blue-600">
                    {streak} days
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const nextIndex = Math.max(0, firstIncompleteIndex);
                  const nextId =
                    modulesList?.[nextIndex]?._id || modulesList?.[0]?._id;
                  if (nextId) navigate(`/learn/module/${nextId}`);
                }}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-[0_6px_0_0_rgba(0,0,0,0.10)]"
              >
                Continue
              </button>
            </div>
          </div>
          {/* Tip card to reduce emptiness */}
          {!tipHidden && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[88%] bg-white border-4 border-blue-300 rounded-2xl px-4 py-3 shadow-[0_8px_0_0_rgba(0,0,0,0.10)]">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold text-blue-700 flex items-center gap-2">
                  <span>💡</span>
                  Tip of the day
                </div>
                <button
                  onClick={() => setTipHidden(true)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-extrabold"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs text-blue-700/80 mt-1 transition-opacity duration-300">
                {tips[tipIndex]}
              </div>
            </div>
          )}
        </aside>
      </div>
    </ReviewProvider>
  );
};

export default LearnDashboard;
