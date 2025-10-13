import React, { useEffect, useState } from 'react';

export default function IncorrectAnswerModal({ isOpen, onClose, onContinue, onTryAgain, incorrectText, correctAnswer }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure smooth animation
      setTimeout(() => setIsVisible(true), 10);
      const onKey = (e) => {
        if (e.key !== 'Enter') return;
        // Prefer Continue when provided, otherwise Try Again
        if (typeof onContinue === 'function') {
          onContinue();
        } else if (typeof onTryAgain === 'function') {
          onTryAgain();
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, onContinue, onTryAgain]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      {/* Bottom-up sliding feedback bar */}
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 border-2 shadow-xl bg-pink-50 border-pink-400 rounded-2xl transition-all duration-300 ease-out ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="max-w-2xl mx-auto px-8 py-4 flex flex-row items-center gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="text-left">
              <div className="text-lg font-extrabold text-gray-900">Incorrect answer</div>
              <div className="text-sm text-gray-700">
                <span>Correct answer: </span>
                {(() => {
                  // Check if correctAnswer is an image URL
                  const isImageUrl = typeof correctAnswer === 'string' && 
                    (correctAnswer.startsWith('http') || correctAnswer.startsWith('https'));
                  
                  if (isImageUrl) {
                    return (
                      <div className="flex items-center gap-2 mt-1">
                        <img 
                          src={correctAnswer} 
                          alt="Correct answer"
                          className="w-12 h-12 object-contain rounded border border-gray-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <span className="text-xs text-gray-500" style={{display: 'none'}}>
                          Image failed to load
                        </span>
                      </div>
                    );
                  } else {
                    return <span className="font-semibold">{correctAnswer}</span>;
                  }
                })()}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {typeof onTryAgain === 'function' && (
              <button
                onClick={onTryAgain}
                className="px-5 py-2 rounded-xl text-white font-extrabold text-sm bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                Try Again
              </button>
            )}
            {typeof onContinue === 'function' && (
              <button
                onClick={onContinue}
                className="px-5 py-2 rounded-xl text-white font-extrabold text-sm bg-green-600 hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
