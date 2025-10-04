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

  useEffect(() => {
    try {
      correctAudio.current = new Audio(correctSfx);
      errorAudio.current = new Audio(errorSfx);
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
  }, [item, moduleNumber, index]);

  // Block browser back and show exit confirm
  useEffect(() => {
    const handlePop = () => {
      setShowExitConfirm(true);
      try { window.history.pushState(null, '', window.location.href); } catch (_) {}
    };
    try { window.history.pushState(null, '', window.location.href); } catch (_) {}
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

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
      <div className="flex items-center justify-between p-4">
        {!actualReviewMode && (
          <button 
            onClick={() => setShowExitConfirm(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        )}
        <div className="flex-1 mx-4">
          <ProgressBar currentIndex={index} total={items.length} />
        </div>
        <div className="flex items-center gap-3">
          
          {/* Show flagged status */}
          {isFlagged && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700">
              <span className="text-lg">✅</span>
              <span className="text-sm font-medium">Marked for Review</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-lg">❤️</span>
            <span className="font-bold">5</span>
          </div>
        </div>
      </div>

      {/* Main Content - full-width white, large text, image box space */}
      <div className="flex-1 flex flex-col items-center px-6">
        <div className="w-full max-w-3xl h-64 rounded-3xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center mt-6">
          <span className="text-gray-400">Image</span>
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 text-center mt-8 mb-8">
          {item.question}
        </h2>

        {/* Text Input for fill-in-the-blank */}
        <div className="w-full max-w-3xl mb-6">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              disabled={showResult}
              className={`w-full p-5 text-xl border-2 rounded-2xl font-bold transition-all ${
                showResult
                  ? isCorrect
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-red-100 border-red-500 text-red-800'
                      : 'bg-white border-gray-300 text-gray-700 focus:border-blue-400 focus:outline-none'
              }`}
            />
          </div>

        {/* Bottom Continue Button */}
        <div className="w-full max-w-3xl mt-auto mb-8">
          <button
            onClick={() => showResult ? handleNext() : handleSubmit()}
            className="w-full py-5 rounded-2xl bg-blue-600 text-white font-extrabold text-xl"
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
          <div className="w-full max-w-3xl">
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


