import ProgressBar from './ProgressBar.jsx';
import SimpleLoading from '../SimpleLoading.jsx';
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useModuleItems } from './useModuleItems';
import authService from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';
// Inline feedback bar instead of modal

export default function McqPage() {
  const navigate = useNavigate();
  const { moduleNumber, index: indexParam } = useParams();
  const index = Number(indexParam || 0);
  const { items, loading, error } = useModuleItems(moduleNumber);
  const item = useMemo(() => items[index] || null, [items, index]);
  const { user } = useAuth();
  const [feedback, setFeedback] = useState({ open: false, correct: false, expected: '' });
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Reset state when item changes
  useEffect(() => {
    setSelectedIndex(null);
    setShowResult(false);
    setIsCorrect(false);
    setFeedback({ open: false, correct: false, expected: '' });
  }, [item]);

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

    // Show feedback modal
    setFeedback({
      open: true,
      correct: correct,
      expected: item.answer
    });

    try {
      if (user?._id) {
        await authService.updateProgress({ 
          userId: user._id, 
          chapter: Number(moduleNumber), 
          lessonTitle: item.title || 'HOT AND COLD', 
          isCorrect: correct 
        });
      }
    } catch (_) {}
  }

  async function handleNext() {
    const nextIndex = index + 1;
    const nextItem = items[nextIndex];
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title');
    const suffix = title ? `?title=${encodeURIComponent(title)}` : '';
    
    if (nextIndex >= items.length) {
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

  if (loading) return <SimpleLoading />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!item) return <SimpleLoading />;
  if (item.type !== 'multiple-choice') return <div className="p-6">No MCQ at this step.</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button 
          onClick={() => navigate('/learn')}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          ✕
        </button>
        <div className="flex-1 mx-4">
      <ProgressBar currentIndex={index} total={items.length} />
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <span className="text-lg">❤️</span>
          <span className="font-bold">5</span>
        </div>
      </div>

      {/* Main Content - full-width white, image between question and options */}
      <div className="flex-1 flex flex-col items-center px-6">

        <h2 className="text-3xl font-extrabold text-gray-900 text-center mt-8 mb-8">
          {item.question}
        </h2>

        {(() => { const imgs = (item.images || []).filter(Boolean); if (imgs.length === 0 && item.imageUrl) imgs.push(item.imageUrl); return imgs.length > 0 ? (
          <div className="w-full max-w-4xl mb-6 flex justify-center">
            <div className="flex flex-wrap justify-center gap-5">
              {((item.images && item.images.filter(Boolean)) || (item.imageUrl ? [item.imageUrl] : [])).slice(0,5).map((src, i) => (
                <div key={i} className="border border-blue-300 rounded-2xl p-3 bg-white shadow-sm">
                  <img src={src} alt={"mcq-"+i} className="h-80 w-64 object-contain rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ) : null })()}

        {!showResult && (
          <div className="w-full max-w-3xl grid grid-cols-1 gap-4 mb-8">
            {item.options?.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrectOption = String(opt).trim().toLowerCase() === item.answer.trim().toLowerCase();
            let buttonClass = "p-5 rounded-2xl border-2 text-center text-xl font-bold transition-all duration-200 hover:scale-[1.01] ";
              
              if (showResult) {
                if (isSelected) {
                  buttonClass += isCorrect ? "bg-green-200 border-green-400 text-green-900" : "bg-red-200 border-red-400 text-red-900";
                } else if (isCorrectOption) {
                  buttonClass += "bg-green-200 border-green-400 text-green-900";
                } else {
                  buttonClass += "bg-gray-100 border-gray-300 text-gray-600";
                }
              } else {
                  buttonClass += "bg-white border-gray-300 text-gray-700 hover:border-blue-400";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  className={buttonClass}
                  disabled={showResult}
                >
                <div className="text-xl">{opt}</div>
                </button>
              );
            })}
          </div>
        )}
        {/* No bottom continue button for MCQ; use the feedback bar's Continue */}
      </div>

      {/* Inline Duolingo-style feedback bar */}
      {showResult && (
        <div className={`fixed left-0 right-0 bottom-0 z-50 border-t-4 shadow-2xl ${isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className={`text-xl font-extrabold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? 'Great job!' : 'Correct solution:'}
              {!isCorrect && <span className="ml-2 font-bold text-gray-800">{item.answer}</span>}
            </div>
            <button
              onClick={handleNext}
              className={`px-8 py-3 rounded-2xl text-white font-extrabold text-xl ${isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              Continue
            </button>
          </div>
      </div>
      )}
    </div>
  );
}


