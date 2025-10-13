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
      <div className={`fixed left-0 right-0 bottom-0 z-50 border-t-4 shadow-2xl bg-pink-50 border-pink-400 transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✕</span>
            <div>
              <div className="text-xl font-extrabold text-gray-900">Incorrect answer</div>
              <div className="text-gray-700 flex items-center gap-3">
                <span>Correct answer:</span>
                {(() => {
                  // Check if correctAnswer is an image URL
                  const isImageUrl = typeof correctAnswer === 'string' && 
                    (correctAnswer.startsWith('http') || correctAnswer.startsWith('https'));
                  
                  if (isImageUrl) {
                    return (
                      <div className="flex items-center gap-2">
                        <img 
                          src={correctAnswer} 
                          alt="Correct answer"
                          className="w-16 h-16 object-contain rounded border border-gray-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <span className="text-sm text-gray-500" style={{display: 'none'}}>
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
                className="px-6 py-3 rounded-2xl text-white font-extrabold text-lg bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                Try Again
              </button>
            )}
            {typeof onContinue === 'function' && (
              <button
                onClick={onContinue}
                className="px-8 py-3 rounded-2xl text-white font-extrabold text-lg bg-green-600 hover:bg-green-700 transition-colors"
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
