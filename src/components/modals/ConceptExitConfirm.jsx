import React from 'react';
import exitImg from '../../assets/images/exit.png';

const ExitConfirmCard = ({ onQuit, onContinue }) => (
  <div className="w-full max-w-xl bg-white border-4 border-blue-200 rounded-3xl p-6 shadow-[0_12px_0_0_rgba(0,0,0,0.10)]">
    <div className="flex items-center gap-6">
      <img src={exitImg} alt="Bye" className="w-28 h-28 md:w-36 md:h-36 object-contain select-none" />
      <div className="flex-1 text-gray-900 font-extrabold text-xl md:text-2xl leading-snug">
        Uh-oh, leaving now means losing your progress points. Still want to exit?
      </div>
    </div>
    <div className="mt-8 flex justify-center gap-4">
      <button onClick={onQuit} className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold">Yes, quit</button>
      <button onClick={onContinue} className="px-6 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-extrabold">No, continue</button>
    </div>
  </div>
);

export default function ConceptExitConfirm({ onQuit, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <ExitConfirmCard onQuit={onQuit} onContinue={onContinue} />
    </div>
  );
}


