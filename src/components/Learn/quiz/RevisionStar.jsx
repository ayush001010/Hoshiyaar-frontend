import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import reviewService from '../../../services/reviewService.js';
import { useReview } from '../../../context/ReviewContext.jsx';

export default function RevisionStar({ align = 'left', moduleId, chapterId }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reset, add } = useReview();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) return;
    setLoading(true);
    reviewService
      .listIncorrect(user._id, moduleId || undefined, chapterId || undefined)
      .then(list => { if (active) setCount(list.length || 0); })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user, moduleId, chapterId]);

  const handleStart = async () => {
    if (!user) return;
    if (chapterId) {
      navigate(`/revision?chapterId=${encodeURIComponent(chapterId)}`);
    } else {
      navigate(`/revision?moduleId=${encodeURIComponent(moduleId || '')}`);
    }
  };

  const sideClass = align === 'right' ? 'items-end text-right' : 'items-start text-left';

  const Icon = () => (
    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 2H7.5C6.12 2 5 3.12 5 4.5v15C5 20.88 6.12 22 7.5 22H19V4c0-1.1-.9-2-2-2zm0 18H7.5c-.55 0-1-.45-1-1V4.5c0-.55.45-1 1-1H18v16z"/>
      <path d="M8 6h8v2H8zM8 10h8v2H8zM8 14h6v2H8z"/>
    </svg>
  );

  return (
    <div className={`flex ${sideClass} my-8`}>
      <div
        onClick={handleStart}
        className="w-20 h-20 md:w-20 md:h-20 rounded-full bg-yellow-400 shadow-[0_8px_0_0_rgba(0,0,0,0.15)] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
        title="Revision"
      >
        <Icon />
      </div>
      {/* Removed loading/count label per request */}
    </div>
  );
}
