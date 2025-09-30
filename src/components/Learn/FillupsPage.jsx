import ProgressBar from './ProgressBar.jsx';
import SimpleLoading from '../SimpleLoading.jsx';
import authService from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';
// Inline feedback bar instead of modal
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useModuleItems } from './useModuleItems';

export default function FillupsPage() {
  const navigate = useNavigate();
  const { moduleNumber, index: indexParam } = useParams();
  const index = Number(indexParam || 0);
  const { items, loading, error } = useModuleItems(moduleNumber);
  const item = useMemo(() => items[index] || null, [items, index]);
  const { user } = useAuth();
  const [feedback, setFeedback] = useState({ open: false, correct: false, expected: '' });
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Reset state when item changes
  useEffect(() => {
    setUserAnswer('');
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

    // Show feedback modal
    setFeedback({
      open: true,
      correct: correct,
      expected: Array.isArray(item.answer) ? item.answer[0] : item.answer
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
  };

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
  if (item.type !== 'fill-in-the-blank') return <div className="p-6">No fill-in-the-blank at this step.</div>;

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

      {/* Inline Duolingo-style feedback bar */}
      {showResult && (
        <div className={`fixed left-0 right-0 bottom-0 z-50 border-t-4 shadow-2xl ${isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className={`text-xl font-extrabold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? 'Great job!' : 'Correct solution:'}
              {!isCorrect && <span className="ml-2 font-bold text-gray-800">{Array.isArray(item.answer) ? item.answer[0] : item.answer}</span>}
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


