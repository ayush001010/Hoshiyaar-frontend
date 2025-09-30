import React, { useState } from 'react';

const ProgressBar = ({ value }) => (
  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
    <div
      className="h-3 bg-gradient-to-r from-yellow-300 to-yellow-500 transition-[width] duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const ConceptLayout = ({ progress = 0, onClose, children, footer }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const requestClose = () => {
    if (onClose) setShowConfirm(true);
  };
  const confirmQuit = () => {
    setShowConfirm(false);
    onClose?.();
  };
  const cancelQuit = () => setShowConfirm(false);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl relative">
        {/* Header with progress */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={requestClose} className="text-gray-500 hover:text-black text-xl">✕</button>
          <div className="flex-1"><ProgressBar value={progress} /></div>
        </div>

        {/* Content card */}
        <div className="border rounded-2xl shadow-xl p-6 bg-white">
          <div className="pb-6">
            {children}
          </div>
          <div className="pt-4 border-t">
            {footer}
          </div>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-11/12 max-w-2xl bg-[#f3f7fc] rounded-2xl p-6 shadow-2xl border">
              <div className="flex gap-4 items-start mb-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">Hoshi</div>
                <div className="flex-1 border rounded-2xl p-4 bg-white text-gray-700">
                  Uh-oh, leaving now means losing your progress points. Still want to exit?
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={confirmQuit} className="px-5 py-2 rounded-lg bg-green-100 text-green-800 font-semibold shadow hover:bg-green-200">Yes, quit</button>
                <button onClick={cancelQuit} className="px-5 py-2 rounded-lg bg-red-100 text-red-700 font-semibold shadow hover:bg-red-200">No, continue</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConceptLayout;


