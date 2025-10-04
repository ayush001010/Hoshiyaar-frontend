import ProgressBar from './ProgressBar.jsx';
import SimpleLoading from '../SimpleLoading.jsx';
import TryAgainModal from './TryAgainModal.jsx';
import IncorrectAnswerModal from './IncorrectAnswerModal.jsx';
// Inline feedback bar instead of modal
import authService from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReview } from '../../context/ReviewContext.jsx';
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useModuleItems } from './useModuleItems';
import ConceptExitConfirm from './Concepts/ConceptExitConfirm.jsx';

export default function RearrangePage({ onQuestionComplete, isReviewMode = false }) {
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
  const [arrangedWords, setArrangedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [feedback, setFeedback] = useState({ open: false, correct: false, expected: '' });
  const [isResetting, setIsResetting] = useState(false);
  const [showTryAgainModal, setShowTryAgainModal] = useState(false);
  const [showIncorrectModal, setShowIncorrectModal] = useState(false);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [isFlagged] = useState(false);
  const [showTryAgainOption, setShowTryAgainOption] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Reset state when item changes; populate words robustly
  useEffect(() => {
    setArrangedWords([]);
    setShowResult(false);
    setIsCorrect(false);
    setDraggedItem(null);
    setFeedback({ open: false, correct: false, expected: '' });
    setShowTryAgainModal(false);
    setShowIncorrectModal(false);
    setHasAnsweredCorrectly(false);
    setShowTryAgainOption(false);

    if (!item) return;
    // Prefer explicit words from item
    let words = Array.isArray(item.words) ? item.words.filter(Boolean) : [];
    if (!words || words.length === 0) {
      // Derive from the correct answer string
      const correctAnswer = Array.isArray(item?.answer) ? String(item.answer[0] || '') : String(item?.answer || '');
      const derived = correctAnswer.split(/\s+/).filter(Boolean);
      // Add a few neutral extras to make the game playable
      const extrasPool = ['the','a','is','are','not','and','in','on','with','of'];
      const extras = extrasPool.slice(0, Math.max(2, derived.length));
      words = [...derived, ...extras];
    }
    // Shuffle
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
  }, [item, moduleNumber, index]);

  // Block browser back
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

  const handleDragStart = (e, word, source, index) => {
    setDraggedItem({ word, source, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { word, source, index: draggedIndex } = draggedItem;

    if (source === 'available' && target === 'arranged') {
      // Move from available to arranged - remove only the specific instance
      setAvailableWords(prev => {
        const newWords = [...prev];
        newWords.splice(draggedIndex, 1);
        return newWords;
      });
      setArrangedWords(prev => [...prev, word]);
    } else if (source === 'arranged' && target === 'available') {
      // Move from arranged to available - remove only the specific instance
      setArrangedWords(prev => {
        const newWords = [...prev];
        newWords.splice(draggedIndex, 1);
        return newWords;
      });
      setAvailableWords(prev => [...prev, word]);
    } else if (source === 'arranged' && target === 'arranged') {
      // Reorder within arranged
      const newArranged = [...arrangedWords];
      const fromIndex = newArranged.indexOf(word);
      const toIndex = parseInt(e.target.dataset.index) || newArranged.length;
      
      if (fromIndex !== toIndex) {
        newArranged.splice(fromIndex, 1);
        newArranged.splice(toIndex, 0, word);
        setArrangedWords(newArranged);
      }
    }

    setDraggedItem(null);
  };

  const handleWordClick = (word, source, index) => {
    if (showResult) return;

    if (source === 'available') {
      setAvailableWords(prev => {
        const newWords = [...prev];
        newWords.splice(index, 1);
        return newWords;
      });
      setArrangedWords(prev => [...prev, word]);
    } else {
      setArrangedWords(prev => {
        const newWords = [...prev];
        newWords.splice(index, 1);
        return newWords;
      });
      setAvailableWords(prev => [...prev, word]);
    }
  };

  const handleResetWords = () => {
    if (arrangedWords.length === 0) return;
    setIsResetting(true);
    // brief animation period
    setTimeout(() => {
      setAvailableWords(prev => [...prev, ...arrangedWords]);
      setArrangedWords([]);
      setIsResetting(false);
    }, 200);
  };

  const handleSubmit = async () => {
    if (showResult) return;
    
    const userAnswer = arrangedWords.join(' ').trim().toLowerCase();
    const correctAnswer = Array.isArray(item.answer) ? item.answer[0] : item.answer;
    const correct = String(correctAnswer || '').trim().toLowerCase() === userAnswer;
    
    setIsCorrect(correct);
    setShowResult(true);

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
      const questionId = `${moduleNumber}_${index}_rearrange`;
      if (!actualReviewMode) {
        addToReview({ questionId, moduleNumber, index, type: 'rearrange' });
      } else {
        requeueActive();
      }
      try {
        if (user?._id) {
          const reviewSvc = (await import('../../services/reviewService.js')).default;
          await reviewSvc.saveIncorrect({ userId: user._id, questionId, moduleId: String(moduleNumber) });
        }
      } catch (_) {}
    }

    // Show feedback modal
    setFeedback({
      open: true,
      correct: correct,
      expected: String(correctAnswer || '')
    });
  };

  async function handleNext(force = false) {
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
      // Count only when module completes
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

  const handleTryAgain = () => {};

  const handleTryAgainClose = () => {
    setShowTryAgainModal(false);
    setShowIncorrectModal(false);
  };

  const handleModalTryAgain = () => {
    setShowIncorrectModal(false);
    setShowResult(false);
    setIsCorrect(false);
    setHasAnsweredCorrectly(false);
    // Return arranged words to available and reshuffle
    setAvailableWords(prev => [...prev, ...arrangedWords].sort(() => Math.random() - 0.5));
    setArrangedWords([]);
  };

  // Flagging removed with revision context

  if (loading) return <SimpleLoading />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!item) return <SimpleLoading />;
  if (item.type !== 'rearrange') return <div className="p-6">No rearrange at this step.</div>;

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

      {/* Main Content - left image, right question + arranged area, word bank below */}
      <div className="flex-1 w-full px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mt-6">
          {/* Image (Left) */}
          <div className="w-full h-64 rounded-3xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
            <span className="text-gray-400">Image</span>
          </div>

          {/* Question + Arranged (Right) */}
          <div className="flex flex-col">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{item.question}</h2>
            {/* Dotted placeholder lines */}
            <div className="space-y-4 mb-6">
              <div className="h-5 border-b-2 border-dotted border-gray-300"></div>
              <div className="h-5 border-b-2 border-dotted border-gray-300 w-11/12"></div>
            </div>
            {/* Arranged Words Area with in-box reset */}
            <div className="relative">
              <div
                className={`min-h-[120px] border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50 ${isResetting ? 'transition-opacity opacity-50' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'arranged')}
              >
                <div className="flex flex-wrap gap-2 min-h-[80px]">
                {arrangedWords.map((word, idx) => (
                  <button
                    key={`arranged-${word}-${idx}`}
                    onClick={() => handleWordClick(word, 'arranged', idx)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, word, 'arranged', idx)}
                    data-index={idx}
                    className={`px-4 py-2 rounded-xl border-2 font-semibold transition-all ${
                      showResult
                        ? isCorrect
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-red-500 border-red-500 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:scale-105 cursor-move'
                    }`}
                    disabled={showResult}
                  >
                    {word}
                  </button>
                ))}
                </div>
              </div>
              {!showResult && (
                <button
                  onClick={handleResetWords}
                  disabled={arrangedWords.length === 0}
                  className={`absolute bottom-3 right-3 w-8 h-8 rounded-full text-white flex items-center justify-center transition-transform ${arrangedWords.length === 0 ? 'bg-gray-400/60 cursor-not-allowed' : 'bg-gray-800/70 hover:scale-105'}`}
                  title="Reset"
                >
                  ↻
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-10">
          {availableWords.length > 0 ? (
            availableWords.map((word, idx) => (
              <button
                key={`available-${word}-${idx}`}
                onClick={() => handleWordClick(word, 'available', idx)}
                draggable
                onDragStart={(e) => handleDragStart(e, word, 'available', idx)}
                disabled={showResult}
                className={`p-3 rounded-xl border-2 font-semibold transition-all ${
                  showResult
                    ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:scale-105 cursor-move'
                }`}
              >
                {word}
              </button>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">No words available for this question.</div>
          )}
        </div>

        {/* Bottom Check Button (no in-page Continue) */}
        <div className="w-full max-w-3xl mx-auto mt-8 mb-8">
          {!showResult && (
            <button
              onClick={handleSubmit}
              className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xl"
            >
              Check
            </button>
          )}
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
                    console.log('[Rearrange DEBUG] Try Again button clicked');
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

      {/* Incorrect Answer Modal (Continue only) */}
      <IncorrectAnswerModal 
        isOpen={showIncorrectModal}
        onClose={() => {}}
        onTryAgain={handleModalTryAgain}
        onContinue={() => handleNext(true)}
        incorrectText={arrangedWords.join(' ')}
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
