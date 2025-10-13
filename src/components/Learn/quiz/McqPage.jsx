import ProgressBar from '../../ui/ProgressBar.jsx';
import SimpleLoading from '../../ui/SimpleLoading.jsx';
import TryAgainModal from '../../modals/TryAgainModal.jsx';
import IncorrectAnswerModal from '../../modals/IncorrectAnswerModal.jsx';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import ConceptExitConfirm from '../../modals/ConceptExitConfirm.jsx';
import correctSfx from '../../../assets/sounds/correct-choice-43861.mp3';
import errorSfx from '../../../assets/sounds/error-010-206498.mp3';
import { useNavigate, useParams } from 'react-router-dom';
import { useModuleItems } from '../../../hooks/useModuleItems';
import authService from '../../../services/authService.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useReview } from '../../../context/ReviewContext.jsx';
import { useStars, StarCounter } from '../../../context/StarsContext.jsx';
// Inline feedback bar instead of modal

export default function McqPage({ onQuestionComplete, isReviewMode = false }) {
  // Local storage helpers for dashboard progress sync
  const LS_KEY = 'lesson_progress_v1';
  const markCompletedLocal = (chapterZeroIdx) => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const store = raw ? JSON.parse(raw) : {};
      const key = 'default';
      const set = new Set(store[key] || []);
      if (Number.isInteger(chapterZeroIdx) && chapterZeroIdx >= 0) set.add(chapterZeroIdx);
      store[key] = Array.from(set);
      localStorage.setItem(LS_KEY, JSON.stringify(store));
    } catch (_) {}
  };
  const IDS_KEY = 'lesson_completed_ids_v1';
  const recordCompletedId = (moduleId) => {
    try {
      const raw = localStorage.getItem(IDS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const set = new Set(arr);
      if (moduleId) set.add(String(moduleId));
      localStorage.setItem(IDS_KEY, JSON.stringify(Array.from(set)));
    } catch (_) {}
  };
  const navigate = useNavigate();
  const { moduleNumber, index: indexParam } = useParams();
  const index = Number(indexParam || 0);
  const { items, loading, error } = useModuleItems(moduleNumber);
  const item = useMemo(() => items[index] || null, [items, index]);
  
  // Check if we're in review mode from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const isReviewModeFromUrl = urlParams.get('review') === 'true';
  const actualReviewMode = isReviewMode || isReviewModeFromUrl;
  const { user } = useAuth();
  const { add: addToReview, removeActive, requeueActive } = useReview();
  const { addStars } = useStars();
  const [feedback, setFeedback] = useState({ open: false, correct: false, expected: '' });
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showTryAgainModal, setShowTryAgainModal] = useState(false);
  const [showIncorrectModal, setShowIncorrectModal] = useState(false);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [isFlagged] = useState(false);
  const [showTryAgainOption, setShowTryAgainOption] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Sound effects
  const correctAudio = useRef(null);
  const errorAudio = useRef(null);

  useEffect(() => {
    try {
      correctAudio.current = new Audio(correctSfx);
      errorAudio.current = new Audio(errorSfx);
      if (correctAudio.current) {
        correctAudio.current.volume = 1.0; // louder for correct
        correctAudio.current.preload = 'auto';
        correctAudio.current.load();
      }
      if (errorAudio.current) {
        errorAudio.current.volume = 0.4; // softer for wrong
        errorAudio.current.preload = 'auto';
        errorAudio.current.load();
      }
    } catch (_) {}
  }, []);


  // Reset state when item changes
  useEffect(() => {
    setSelectedIndex(null);
    setShowResult(false);
    setIsCorrect(false);
    setFeedback({ open: false, correct: false, expected: '' });
    setShowTryAgainModal(false);
    setShowIncorrectModal(false);
    setHasAnsweredCorrectly(false);
    setShowTryAgainOption(false);
  }, [item, moduleNumber, index]);

  // Allow native browser back (no intercept)
  useEffect(() => {}, []);

  // Enter to continue/submit
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Enter') return;
      console.log('[MCQ] Enter pressed', { showResult, selectedIndex });
      if (!item) return;
      if (!showResult) {
        // if nothing selected, select first option
        const idx = selectedIndex == null ? 0 : selectedIndex;
        console.log('[MCQ] Submitting option via Enter', idx);
        handleOptionClick(idx);
      } else {
        // after result, go next
        console.log('[MCQ] Continuing via Enter');
        handleNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, showResult, selectedIndex]);

  function routeForType(type, idx) {
    switch (type) {
      case 'concept':
      case 'statement':
        return `/learn/module/${moduleNumber}/concept/${idx}`;
      case 'multiple-choice': return `/learn/module/${moduleNumber}/mcq/${idx}`;
      case 'fill-in-the-blank': return `/learn/module/${moduleNumber}/fillups/${idx}`;
      case 'rearrange': return `/learn/module/${moduleNumber}/rearrange/${idx}`;
      default: return `/learn`;
    }
  }

  async function handleOptionClick(optionIndex) {
    if (showResult) return;
    
    setSelectedIndex(optionIndex);
    const selectedOption = item.options[optionIndex];
    const correct = String(selectedOption).trim().toLowerCase() === item.answer.trim().toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);

    // Play feedback sound (user gesture triggered)
    try {
      const src = correct ? correctAudio.current : errorAudio.current;
      if (src) {
        src.currentTime = 0;
        const p = src.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    } catch (_) {}

    if (correct) {
      setHasAnsweredCorrectly(true);
      setShowTryAgainOption(false); // Hide try again when correct
      // scoring: +5 normally, +10 in revision
      addStars(actualReviewMode ? 10 : 5);
      
      // If in review mode, notify and go back to module
      if (actualReviewMode) {
        removeActive();
        navigate('/review-round');
      }
    } else {
      // Immediate feedback and enqueue for review
      setShowTryAgainOption(false);
      setShowIncorrectModal(true);
      // scoring penalty
      if (!actualReviewMode) addStars(-2);
      const questionId = `${moduleNumber}_${index}_multiple-choice`;
      if (!actualReviewMode) {
        addToReview({ questionId, moduleNumber, index, type: 'multiple-choice' });
      } else {
        // In review mode, keep it in rotation by moving to end
        requeueActive();
      }
      try {
        if (user?._id) {
          const reviewSvc = (await import('../../../services/reviewService.js')).default;
          await reviewSvc.saveIncorrect({ userId: user._id, questionId, moduleId: String(moduleNumber) });
        }
      } catch (_) {}
    }

    // Show feedback modal
    setFeedback({
      open: true,
      correct: correct,
      expected: item.answer
    });
  }

  async function handleNext(force = false) {
    console.log('[MCQ] handleNext called', { force, hasAnsweredCorrectly, isCorrect });
    // Allow forced advance (from incorrect modal). Otherwise require correct.
    if (!force && !hasAnsweredCorrectly && !isCorrect) {
      return;
    }

    // In review mode, on forced advance dispatch completion and return to module
    if (actualReviewMode) {
      if (force) {
        // Incorrect path: keep item (already requeued), just advance
        navigate('/review-round');
        return;
      }
      if (isCorrect) {
        removeActive();
        navigate('/review-round');
        return;
      }
      return;
    }

    const nextIndex = index + 1;
    const nextItem = items[nextIndex];
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title');
    const suffix = title ? `?title=${encodeURIComponent(title)}` : '';
    
    if (nextIndex >= items.length) {
      // Finished module: now count progress
      try {
        if (user?._id) await authService.updateProgress({ userId: user._id, chapter: Number(moduleNumber), conceptCompleted: true });
      } catch (_) {}
      // Also persist locally so dashboard immediately reflects completion
      try {
        const zeroIdx = Number(moduleNumber) - 1;
        markCompletedLocal(zeroIdx);
        // Store by module id
        recordCompletedId(moduleNumber);
      } catch (_) {}
      return navigate('/lesson-complete');
    }
    navigate(`${routeForType(nextItem.type, nextIndex)}${suffix}`);
  }

  const handleFeedbackClose = () => {
    setFeedback({ open: false, correct: false, expected: '' });
  };

  const handleFeedbackNext = () => {
    setFeedback({ open: false, correct: false, expected: '' });
    handleNext();
  };

  const handleTryAgain = () => {
    // Local-only reset for demo try-again; no backend or review queue changes
    setShowIncorrectModal(false);
    setShowResult(false);
    setIsCorrect(false);
    setHasAnsweredCorrectly(false);
    setSelectedIndex(null);
  };

  const handleTryAgainClose = () => {
    setShowTryAgainModal(false);
    setShowIncorrectModal(false);
  };

  // Flagging removed with revision context

  if (loading) return <SimpleLoading />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!item) return <SimpleLoading />;
  if (item.type !== 'multiple-choice') return <div className="p-6">No MCQ at this step.</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        {!actualReviewMode && (
          <button 
            onClick={() => setShowExitConfirm(true)}
            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            ✕
          </button>
        )}
        <div className="flex-1 mx-2 sm:mx-4">
      <ProgressBar currentIndex={index} total={items.length} />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Show flagged status */}
          {isFlagged && (
            <div className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg bg-green-50 border border-green-200 text-green-700">
              <span className="text-sm sm:text-lg">✅</span>
              <span className="text-xs sm:text-sm font-medium">Marked for Review</span>
            </div>
          )}
          
          <StarCounter />
        </div>
      </div>

      {/* Main Content - responsive text and spacing */}
      <div className="flex-1 flex flex-col items-center px-3 sm:px-4 md:px-6">

        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-900 text-center mt-4 sm:mt-6 md:mt-8 mb-2 sm:mb-3 md:mb-4 text-overflow-fix px-2">
          {item.question}
        </h2>

        {(() => { 
          // Check if options are image URLs - if so, don't show question images
          const hasImageOptions = item.options?.some(opt => typeof opt === 'string' && (opt.startsWith('http') || opt.startsWith('https')));
          if (hasImageOptions) return null;
          
          const imgs = (item.images || []).filter(Boolean); 
          if (imgs.length === 0 && item.imageUrl) imgs.push(item.imageUrl); 
          return imgs.length > 0 ? (
            <div className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl mb-2 sm:mb-3 flex justify-center">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-5">
                {((item.images && item.images.filter(Boolean)) || (item.imageUrl ? [item.imageUrl] : [])).slice(0,5).map((src, i) => (
                  <div key={i} className="border border-blue-300 rounded-xl sm:rounded-2xl p-2 sm:p-3 bg-white shadow-sm">
                    <img src={src} alt={'mcq-'+i} className="h-32 w-28 sm:h-44 sm:w-36 md:h-56 md:w-44 lg:h-72 lg:w-56 xl:h-80 xl:w-64 object-contain rounded-lg sm:rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          ) : null 
        })()}

        {!showResult && (
          <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mb-3 sm:mb-4">
            {(() => {
              // Check if any options are image URLs
              const hasImageOptions = item.options?.some(opt => typeof opt === 'string' && (opt.startsWith('http') || opt.startsWith('https')));
              
              // Use horizontal layout for image options, vertical for text options
              const containerClass = hasImageOptions 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6" 
                : "grid grid-cols-1 gap-3 sm:gap-4 max-w-2xl sm:max-w-3xl mx-auto";
              
              return (
                <div className={containerClass}>
                  {item.options?.map((opt, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isCorrectOption = String(opt).trim().toLowerCase() === item.answer.trim().toLowerCase();
                    const isImageUrl = typeof opt === 'string' && (opt.startsWith('http') || opt.startsWith('https'));
                    
                    let buttonClass = hasImageOptions 
                      ? "p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border-2 text-center transition-all duration-200 hover:scale-[1.02] " 
                      : "p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-center transition-all duration-200 hover:scale-[1.01] w-full ";
              
              if (showResult) {
                if (isSelected) {
                  buttonClass += isCorrect ? "bg-green-200 border-green-400" : "bg-red-200 border-red-400";
                } else if (isCorrectOption) {
                  buttonClass += "bg-green-200 border-green-400";
                } else {
                  buttonClass += "bg-gray-100 border-gray-300";
                }
              } else {
                buttonClass += "bg-white border-gray-300 hover:border-blue-400";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  className={buttonClass}
                  disabled={showResult}
                >
                  {isImageUrl ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={opt} 
                        alt={`Option ${idx + 1}`}
                        className="w-full h-20 sm:h-28 md:h-32 lg:h-40 object-contain rounded-lg mb-1 sm:mb-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="text-xs sm:text-sm text-gray-600 font-medium" style={{display: 'none'}}>
                        Option {idx + 1}
                      </div>
                      <div className="text-xs sm:text-sm md:text-base font-semibold text-gray-700">
                        Option {idx + 1}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-700 text-overflow-fix">{opt}</div>
                  )}
                </button>
                  );
                })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Show results when answered */}
        {showResult && (
          <div className="w-full max-w-4xl mb-4">
            {(() => {
              // Check if any options are image URLs
              const hasImageOptions = item.options?.some(opt => typeof opt === 'string' && (opt.startsWith('http') || opt.startsWith('https')));
              
              // Use horizontal layout for image options, vertical for text options
              const containerClass = hasImageOptions 
                ? "grid grid-cols-1 md:grid-cols-3 gap-6" 
                : "grid grid-cols-1 gap-4 max-w-3xl mx-auto";
              
              return (
                <div className={containerClass}>
                  {item.options?.map((opt, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isCorrectOption = String(opt).trim().toLowerCase() === item.answer.trim().toLowerCase();
                    const isImageUrl = typeof opt === 'string' && (opt.startsWith('http') || opt.startsWith('https'));
                    
                    let buttonClass = hasImageOptions 
                      ? "p-4 rounded-2xl border-2 text-center transition-all duration-200 " 
                      : "p-4 rounded-2xl border-2 text-center transition-all duration-200 w-full ";
              
              if (isSelected) {
                buttonClass += isCorrect ? "bg-green-200 border-green-400" : "bg-red-200 border-red-400";
              } else if (isCorrectOption) {
                buttonClass += "bg-green-200 border-green-400";
              } else {
                buttonClass += "bg-gray-100 border-gray-300";
              }

              return (
                <div
                  key={idx}
                  className={buttonClass}
                >
                  {isImageUrl ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={opt} 
                        alt={`Option ${idx + 1}`}
                        className="w-full h-48 object-contain rounded-lg mb-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="text-sm text-gray-600 font-medium" style={{display: 'none'}}>
                        Option {idx + 1}
                      </div>
                      <div className="text-lg font-semibold text-gray-700 mb-2">
                        Option {idx + 1}
                      </div>
                      {/* Show checkmark or X for selected/correct options */}
                      <div>
                        {isSelected && (
                          <span className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {isCorrect ? '✓' : '✗'}
                          </span>
                        )}
                        {!isSelected && isCorrectOption && (
                          <span className="text-2xl text-green-600">✓</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-gray-700">{opt}</div>
                      {/* Show checkmark or X for selected/correct options */}
                      <div>
                        {isSelected && (
                          <span className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {isCorrect ? '✓' : '✗'}
                          </span>
                        )}
                        {!isSelected && isCorrectOption && (
                          <span className="text-2xl text-green-600">✓</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                  );
                })}
                </div>
              );
            })()}
          </div>
        )}
        {/* No bottom continue button for MCQ; use the feedback bar's Continue */}
      </div>

      {/* Inline feedback bar - show only for correct answers; incorrect uses modal */}
      {showResult && !actualReviewMode && isCorrect && (
        <div className={`fixed left-0 right-0 bottom-0 z-50 border-t-4 shadow-2xl ${
          isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
        }`}>
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className={`text-xl font-extrabold ${
              isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {isCorrect ? 'Great job!' : 'Not quite right.'}
            </div>
            <div className="flex gap-3">
              {/* Show Try Again button ONLY for incorrect answers */}
              {!isCorrect && showTryAgainOption && (
                <button
                  onClick={() => {
                    console.log('[MCQ DEBUG] Try Again button clicked');
                    handleTryAgain();
                  }}
                  className="px-6 py-3 rounded-2xl text-white font-extrabold text-lg bg-orange-600 hover:bg-orange-700 transition-colors"
                >
                  Try Again
                </button>
              )}
              {/* Show Continue button ONLY for correct answers */}
              {isCorrect && (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 rounded-2xl text-white font-extrabold text-xl bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Review mode success message */}
      {showResult && isCorrect && actualReviewMode && (
        <div className="fixed left-0 right-0 bottom-0 z-50 border-t-4 shadow-2xl bg-green-50 border-green-400">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-center">
            <div className="text-xl font-extrabold text-green-700">
              Great job! Moving to next question...
            </div>
          </div>
        </div>
      )}

      {/* Incorrect Answer Modal (Try Again only) */}
      <IncorrectAnswerModal 
        isOpen={showIncorrectModal}
        onClose={() => {}}
        onTryAgain={handleTryAgain}
        incorrectText={selectedIndex != null ? String(item.options[selectedIndex]) : ''}
        correctAnswer={item?.answer}
      />

      {/* Exit confirmation overlay */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="w-full max-w-md">
            <ConceptExitConfirm
              progress={Math.round(((index+1)/Math.max(1, items.length))*100)}
              onQuit={() => navigate('/learn')}
              onContinue={() => setShowExitConfirm(false)}
              onClose={() => setShowExitConfirm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}


