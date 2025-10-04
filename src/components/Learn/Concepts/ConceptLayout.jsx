import React, { useEffect, useState } from 'react';
import ConceptExitConfirm from './ConceptExitConfirm.jsx';

const ConceptLayout = ({ children, footer, onQuit }) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    const handlePop = () => {
      setShowExitConfirm(true);
      try { window.history.pushState(null, '', window.location.href); } catch (_) {}
    };
    const handleKey = (e) => {
      // Trap common back navigation shortcut (Alt + Left Arrow)
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        setShowExitConfirm(true);
      }
    };
    try { window.history.pushState(null, '', window.location.href); } catch (_) {}
    window.addEventListener('popstate', handlePop);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('popstate', handlePop);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const quit = () => {
    if (typeof onQuit === 'function') onQuit();
    else try { window.location.href = '/learn'; } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="border-4 border-blue-200 rounded-2xl shadow-xl p-6 bg-white">
          <div className="pb-6">
            {children}
          </div>
          <div className="pt-4 border-t">
            {footer}
          </div>
        </div>
      </div>
      {showExitConfirm && (
        <div className="fixed inset-0 z-[9999]">
          <ConceptExitConfirm onQuit={quit} onContinue={() => setShowExitConfirm(false)} />
        </div>
      )}
    </div>
  );
};

export default ConceptLayout;


