import React, { useMemo, useState, useEffect, useCallback } from 'react';
import ProgressBar from '../../ui/ProgressBar.jsx';
import SimpleLoading from '../../ui/SimpleLoading.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { useModuleItems } from '../../../hooks/useModuleItems';
import authService from '../../../services/authService.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import ConceptExitConfirm from '../../modals/ConceptExitConfirm.jsx';

export default function ConceptPage() {
  const navigate = useNavigate();
  const { moduleNumber, index: indexParam } = useParams();
  const index = Number(indexParam || 0);
  const { items, loading, error } = useModuleItems(moduleNumber);
  const { user } = useAuth();
  const item = useMemo(() => items[index] || null, [items, index]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Removed back/popstate interception

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

  const goNext = useCallback(async () => {
    const nextIndex = index + 1;
    if (nextIndex >= items.length) {
      // Mark chapter completed and return
      try {
        if (user?._id) {
          await authService.updateProgress({ userId: user._id, chapter: Number(moduleNumber), conceptCompleted: true });
        }
      } catch (_) {}
      return navigate('/lesson-complete');
    }
    const nextItem = items[nextIndex];
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title');
    const suffix = title ? `?title=${encodeURIComponent(title)}` : '';
    navigate(`${routeForType(nextItem.type, nextIndex)}${suffix}`);
  }, [index, items, user, moduleNumber, navigate]);

  // Allow advancing with Enter key when the exit confirmation is not visible
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Enter' && !showExitConfirm) {
        event.preventDefault();
        goNext();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, showExitConfirm]);

  if (loading) return <SimpleLoading />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!item) return <SimpleLoading />;
  if (item.type !== 'concept' && item.type !== 'statement') return <div className="p-6">No concept at this step.</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        <button 
          onClick={() => setShowExitConfirm(true)}
          className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-sm sm:text-base"
        >
          ✕
        </button>
        <div className="flex-1 mx-2 sm:mx-4">
          <ProgressBar currentIndex={index} total={items.length} />
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-gray-700">
          <span className="text-sm sm:text-lg">❤️</span>
          <span className="font-bold text-sm sm:text-base">5</span>
        </div>
      </div>

      {/* Main Content - responsive text and spacing */}
      <div className="flex-1 flex flex-col items-center px-3 sm:px-4 md:px-6">

        {/* Title and Text */}
        {item.title && (
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 text-center mt-4 sm:mt-6 md:mt-8 text-overflow-fix px-2">
            {item.title}
          </h2>
        )}
        <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mt-4 sm:mt-6 md:mt-8 lg:mt-10">
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-extrabold text-gray-900 leading-relaxed whitespace-pre-wrap text-center text-overflow-fix px-2"
            dangerouslySetInnerHTML={{ __html: String(item.text || item.content || '') }}
          />
        </div>

        {/* Images block (between text and button) */}
        {(() => { const imgs = (item.images || []).filter(Boolean); if (imgs.length === 0 && item.imageUrl) imgs.push(item.imageUrl); return imgs.length > 0 ? (
          <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mt-4 sm:mt-6 md:mt-8 flex justify-center">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-5">
              {((item.images && item.images.filter(Boolean)) || (item.imageUrl ? [item.imageUrl] : [])).slice(0,5).map((src, i) => (
                <div key={i} className="border border-blue-300 rounded-xl sm:rounded-2xl p-2 sm:p-3 bg-white shadow-sm">
                  <img src={src} alt={'concept-'+i} className="h-32 w-24 sm:h-48 sm:w-36 md:h-60 md:w-44 lg:h-80 lg:w-60 xl:h-[22rem] xl:w-[16rem] object-contain rounded-lg sm:rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ) : null })()}

        {/* Bottom Continue button */}
        <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl mt-auto mb-4 sm:mb-6 md:mb-8">
          <button 
            onClick={goNext}
            className="w-full py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl bg-blue-600 text-white font-extrabold text-base sm:text-lg md:text-xl hover:bg-blue-700 transition-colors btn-responsive"
          >
            Continue
          </button>
        </div>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-[9999]">
          <ConceptExitConfirm onQuit={() => navigate('/learn')} onContinue={() => setShowExitConfirm(false)} />
        </div>
      )}
    </div>
  );
}


