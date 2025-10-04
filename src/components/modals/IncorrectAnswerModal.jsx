import React, { useEffect, useState } from 'react';

export default function IncorrectAnswerModal({ isOpen, onClose, onContinue, onTryAgain, incorrectText, correctAnswer }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure smooth animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      {/* Bottom-up sliding feedback bar */}
      <div className={`fixed left-0 right-0 bottom-0 z-50 border-t-4 shadow-2xl bg-pink-50 border-pink-400 transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✕</span>
            <div>
              <div className="text-xl font-extrabold text-gray-900">Incorrect answer</div>
              <div className="text-gray-700">
                Correct answer: <span className="font-semibold">{correctAnswer}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {typeof onTryAgain === 'function' && (
              <button
                onClick={onTryAgain}
                className="px-6 py-3 rounded-2xl text-white font-extrabold text-lg bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
