import React, { useMemo, useState, useEffect } from 'react';
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

  async function goNext() {
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
  }

  if (loading) return <SimpleLoading />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!item) return <SimpleLoading />;
  if (item.type !== 'concept' && item.type !== 'statement') return <div className="p-6">No concept at this step.</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button 
          onClick={() => setShowExitConfirm(true)}
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

      {/* Main Content - full width white, large text, image between text and button */}
      <div className="flex-1 flex flex-col items-center px-6">

        {/* Title and Text */}
        {item.title && (
          <h2 className="text-4xl font-extrabold text-gray-900 text-center mt-8">
            {item.title}
          </h2>
        )}
        <div className="w-full max-w-4xl mt-10">
          <p
            className="text-3xl font-extrabold text-gray-900 leading-relaxed whitespace-pre-wrap text-center"
            dangerouslySetInnerHTML={{ __html: String(item.text || item.content || '') }}
          />
        </div>

        {/* Images block (between text and button) */}
        {(() => { const imgs = (item.images || []).filter(Boolean); if (imgs.length === 0 && item.imageUrl) imgs.push(item.imageUrl); return imgs.length > 0 ? (
          <div className="w-full max-w-4xl mt-8 flex justify-center">
            <div className="flex flex-wrap justify-center gap-5">
              {((item.images && item.images.filter(Boolean)) || (item.imageUrl ? [item.imageUrl] : [])).slice(0,5).map((src, i) => (
                <div key={i} className="border border-blue-300 rounded-2xl p-3 bg-white shadow-sm">
                  <img src={src} alt={'concept-'+i} className="h-80 w-64 object-contain rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ) : null })()}

        {/* Bottom Continue button */}
        <div className="w-full max-w-3xl mt-auto mb-8">
          <button 
            onClick={goNext}
            className="w-full py-5 rounded-2xl bg-blue-600 text-white font-extrabold text-xl hover:bg-blue-700 transition-colors"
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


