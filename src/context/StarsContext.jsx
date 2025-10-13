import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const StarsContext = createContext(null);

export const useStars = () => {
  const ctx = useContext(StarsContext);
  if (!ctx) throw new Error('useStars must be used within StarsProvider');
  return ctx;
};

const STORAGE_KEY = 'hs_stars_total_v1';

export const StarsProvider = ({ children }) => {
  const [stars, setStars] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const n = Number(raw);
      return Number.isFinite(n) ? n : 0;
    } catch (_) {
      return 0;
    }
  });
  const [delta, setDelta] = useState(0); // for +5 / -2 flyout
  const timerRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(stars)); } catch (_) {}
  }, [stars]);

  const addStars = (amount) => {
    if (!Number.isFinite(amount) || amount === 0) return;
    setStars((s) => Math.max(0, s + amount));
    setDelta(amount);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDelta(0), 1200);
  };

  const value = useMemo(() => ({ stars, addStars, delta }), [stars, delta]);
  return <StarsContext.Provider value={value}>{children}</StarsContext.Provider>;
};

export const StarCounter = () => {
  const { stars, delta } = useStars();
  return (
    <div className="relative flex items-center gap-1 sm:gap-2 text-gray-800 select-none">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="sm:w-5 sm:h-5"
        aria-hidden="true"
      >
        <path
          d="M12 2.75l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 18.77l-5.9 3.16 1.13-6.58L2.45 9.69l6.6-.96L12 2.75z"
          fill="#FACC15"
          stroke="#EAB308"
          strokeWidth="0.8"
        />
      </svg>
      <span className="font-extrabold text-sm sm:text-base tabular-nums">{stars}</span>
      {delta !== 0 && (
        <span
          className={`absolute -top-3 left-4 text-xs sm:text-sm font-bold transition-all duration-700 ease-out ${
            delta > 0 ? 'text-green-600' : 'text-red-600'
          } animate-[starDelta_1.2s_ease-out_forwards]`}
        >
          {delta > 0 ? `+${delta}` : `${delta}`}
        </span>
      )}
      <style>{`
        @keyframes starDelta {
          0% { opacity: 1; transform: translateY(0); }
          60% { opacity: 0.7; transform: translateY(-10px); }
          100% { opacity: 0.0; transform: translateY(-18px); color: #9ca3af; }
        }
      `}</style>
    </div>
  );
};


