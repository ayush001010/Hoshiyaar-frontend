import React from 'react';
import { useNavigate } from 'react-router-dom';
import image07 from '../../Images/image-07.png';

const LessonComplete = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <img
        src={image07}
        alt="Celebration"
        className="w-80 h-80 md:w-[26rem] md:h-[26rem] object-contain drop-shadow-xl"
      />
      <h1 className="mt-6 text-3xl md:text-5xl font-extrabold text-gray-900">
        Lesson complete - well done Superstar!
      </h1>
      <p className="mt-3 text-xl md:text-2xl text-gray-700 max-w-3xl">
        You rocked this lesson. Ready for the next adventure?
      </p>
      <button
        onClick={() => navigate('/learn?go=dashboard')}
        className="mt-10 w-full max-w-md py-5 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl hover:bg-blue-700 transition-colors shadow-[0_8px_0_0_rgba(0,0,0,0.15)]"
      >
        Continue
      </button>
    </div>
  );
};

export default LessonComplete;


