import ProgressBar from '../../ui/ProgressBar.jsx';
import SimpleLoading from '../../ui/SimpleLoading.jsx';
import TryAgainModal from '../../modals/TryAgainModal.jsx';
import IncorrectAnswerModal from '../../modals/IncorrectAnswerModal.jsx';
import authService from '../../../services/authService.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useReview } from '../../../context/ReviewContext.jsx';
// Inline feedback bar instead of modal
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useModuleItems } from '../../../hooks/useModuleItems';
import ConceptExitConfirm from '../../modals/ConceptExitConfirm.jsx';
import correctSfx from '../../../assets/sounds/correct-choice-43861.mp3';
import errorSfx from '../../../assets/sounds/error-010-206498.mp3';

export default function FillupsPage({ onQuestionComplete, isReviewMode = false }) {
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
  const [feedback, setFeedback] = useState({ open: false, correct: false, expected: '' });
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showTryAgainModal, setShowTryAgainModal] = useState(false);
  const [showIncorrectModal, setShowIncorrectModal] = useState(false);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [isFlagged] = useState(false);
  const [showTryAgainOption, setShowTryAgainOption] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const correctAudio = useRef(null);
  const errorAudio = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      correctAudio.current = new Audio(correctSfx);
      errorAudio.current = new Audio(errorSfx);
      if (correctAudio.current) correctAudio.current.volume = 1.0; // louder correct
      if (errorAudio.current) errorAudio.current.volume = 0.4; // softer wrong
      correctAudio.current?.load?.();
      errorAudio.current?.load?.();
    } catch (_) {}
  }, []);

  // Reset state when item changes
  useEffect(() => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setFeedback({ open: false, correct: false, expected: '' });
    setShowTryAgainModal(false);
    setShowIncorrectModal(false);
    setHasAnsweredCorrectly(false);
    setShowTryAgainOption(false);
    // Focus input on new question
    const id = setTimeout(() => {
      try { if (inputRef.current) inputRef.current.focus(); } catch (_) {}
    }, 0);
    return () => clearTimeout(id);
  }, [item, moduleNumber, index]);

  // Allow browser back
  useEffect(() => {}, []);

  // Enter to submit/continue
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Enter') return;
      console.log('[FILLUPS] Enter pressed', { showResult, userAnswer });
      if (!item) return;
      if (!showResult) {
        console.log('[FILLUPS] Submitting via Enter');
        handleSubmit();
      } else {
        console.log('[FILLUPS] Continuing via Enter');
        handleNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, showResult, userAnswer]);

  // Keep caret in input when result is hidden
  useEffect(() => {
    if (!showResult) {
      try { if (inputRef.current) inputRef.current.focus(); } catch (_) {}
    }
  }, [showResult]);

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


  const handleSubmit = async () => {
    if (showResult || !item || !item.answer) return;
    
    const answer = userAnswer.trim().toLowerCase();
    let correct = false;
    
    if (Array.isArray(item.answer)) {
      correct = item.answer.some(ans => ans.trim().toLowerCase() === answer);
    } else {
      correct = item.answer.trim().toLowerCase() === answer;
    }
    
    setIsCorrect(correct);
    setShowResult(true);

    try { (correct ? correctAudio : errorAudio)?.current?.play?.(); } catch (_) {}

    if (correct) {
      setHasAnsweredCorrectly(true);
      setShowTryAgainOption(false); // Hide try again when correct
      
      if (actualReviewMode) {
        removeActive();
        navigate('/review-round');
      }
    } else {
      // Immediate feedback and enqueue for review
      setShowTryAgainOption(false);
      setShowIncorrectModal(true);
      const questionId = `${moduleNumber}_${index}_fill-in-the-blank`;
      if (!actualReviewMode) {
        addToReview({ questionId, moduleNumber, index, type: 'fill-in-the-blank' });
      } else {
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
      expected: Array.isArray(item.answer) ? item.answer[0] : item.answer
    });
  };

  async function handleNext(force = false) {
    console.log('[FILLUPS] handleNext called', { force, hasAnsweredCorrectly, isCorrect });
    // Allow forced advance from incorrect modal
    if (!force && !hasAnsweredCorrectly && !isCorrect) {
      return;
    }

    if (actualReviewMode) {
      if (force) {
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
      // Count progress only when module completes
      try { 
        if (user?._id) await authService.updateProgress({ userId: user._id, chapter: Number(moduleNumber), conceptCompleted: true }); 
      } catch (_) {}
      return navigate('/lesson-complete');
    }
    navigate(`${routeForType(nextItem.type, nextIndex)}${suffix}`);
  }

  // Backward-compat alias in case any stale listeners call goNext
  const goNext = (force = false) => handleNext(force);

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
    setUserAnswer('');
  };

  const handleTryAgainClose = () => {
    setShowTryAgainModal(false);
    setShowIncorrectModal(false);
  };

  // Flagging removed with revision context

  if (loading) return <SimpleLoading />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!item) return <SimpleLoading />;
  if (item.type !== 'fill-in-the-blank') return <div className="p-6">No fill-in-the-blank at this step.</div>;

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
          
          <div className="flex items-center gap-1 sm:gap-2 text-gray-700">
            <span className="text-sm sm:text-lg">❤️</span>
            <span className="font-bold text-sm sm:text-base">5</span>
          </div>
        </div>
      </div>

      {/* Main Content - responsive text and spacing */}
      <div className="flex-1 flex flex-col items-center px-3 sm:px-4 md:px-6">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-900 text-center mt-4 sm:mt-6 md:mt-8 mb-2 sm:mb-3 md:mb-4 text-overflow-fix px-2">
          {item.question}
        </h2>

        {/* Image block BETWEEN question and input. If no image, reserve space */}
        {(() => {
          const imgs = (item.images || []).filter(Boolean);
          const primary = item.imageUrl ? [item.imageUrl] : [];
          const list = imgs.length > 0 ? imgs : primary;
          if (list.length === 0) {
            return (
              <div className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl h-40 sm:h-60 md:h-72 rounded-2xl sm:rounded-3xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                <span className="text-gray-400 text-sm sm:text-base">Image</span>
              </div>
            );
          }
          return (
            <div className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl mb-2 sm:mb-3 flex justify-center">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-5">
                {list.slice(0, 5).map((src, i) => (
                  <div key={i} className="border border-blue-300 rounded-xl sm:rounded-2xl p-2 sm:p-3 bg-white shadow-sm">
                    <img src={src} alt={`fillup-${i}`} className="h-28 w-20 sm:h-40 sm:w-28 md:h-52 md:w-40 lg:h-64 lg:w-48 object-contain rounded-lg sm:rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Text Input for fill-in-the-blank */}
        <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl mb-2 sm:mb-3">
            <input
              type="text"
              ref={inputRef}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type the full word here..."
              disabled={showResult}
              autoFocus
              className={`w-full p-3 sm:p-3.5 md:p-4 text-sm sm:text-sm md:text-base lg:text-lg border-2 rounded-xl sm:rounded-2xl font-bold transition-all ${
                showResult
                  ? isCorrect
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-red-100 border-red-500 text-red-800'
                      : 'bg-white border-gray-300 text-gray-700 focus:border-blue-400 focus:outline-none'
              }`}
            />
          </div>

        {/* Bottom Continue Button */}
        <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl mt-auto mb-4 sm:mb-6 md:mb-8">
          <button
            onClick={() => showResult ? handleNext() : handleSubmit()}
            className="w-full py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl bg-blue-600 text-white font-extrabold text-base sm:text-lg md:text-xl btn-responsive"
          >
            {showResult ? 'Continue' : 'Check'}
          </button>
        </div>
      </div>

      {/* Inline Duolingo-style feedback bar - show for both correct and incorrect answers */}
      {showResult && !actualReviewMode && (
        <div className={`fixed left-0 right-0 bottom-0 z-50 border-t-4 shadow-2xl ${
          isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
        }`}>
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className={`text-xl font-extrabold ${
              isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {isCorrect ? 'Great job!' : 'Not quite right. Try again!'}
            </div>
            <div className="flex gap-3">
              {/* Show Try Again button ONLY for incorrect answers */}
              {!isCorrect && showTryAgainOption && (
                <button
                  onClick={() => {
                    console.log('[Fillups DEBUG] Try Again button clicked');
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
        incorrectText={userAnswer}
        correctAnswer={Array.isArray(item?.answer) ? item?.answer[0] : item?.answer}
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


