import React from 'react';
import ConceptLayout from './ConceptLayout.jsx';

const ConceptExitConfirm = ({ onQuit, onContinue, onClose, progress = 70 }) => {
  return (
    <ConceptLayout progress={progress} onClose={onClose}
      footer={
        <div className="flex justify-center gap-4">
          <button onClick={onQuit} className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">Yes, quit</button>
          <button onClick={onContinue} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">No, continue</button>
        </div>
      }>
      <div className="flex gap-3 items-start">
        <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">Hoshi</div>
        <div className="flex-1 border rounded-2xl p-6">
          Uh-oh, leaving now means losing your progress points. Still want to exit?
        </div>
      </div>
    </ConceptLayout>
  );
};

export default ConceptExitConfirm;


