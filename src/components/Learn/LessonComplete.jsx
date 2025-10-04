import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReview } from '../../context/ReviewContext.jsx';
import image07 from '../../Images/image-07.png';
import heroChar from '../../Images/heroChar.png';
import finishImg from '../../Images/finish.png';
 
const LessonComplete = () => {
  const navigate = useNavigate();
  const { moduleNumber } = useParams();
  const [isChecking, setIsChecking] = useState(true);
  const { hasItems } = useReview();

  useEffect(() => {
    setIsChecking(false);
  }, []);

  

  const handleContinue = () => {
    navigate('/learn?go=dashboard');
  };

  const handleGoToDashboard = () => {
    navigate('/learn?go=dashboard');
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-16 py-2 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-lg text-gray-600">Checking for review questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-16 py-2 text-center">
      
      {hasItems ? (
        <>
          {/* Character + speech bubble */}
          <div className="mt-6 w-full max-w-3xl flex flex-col items-center">
            <img src={heroChar} alt="Mascot" className="w-56 h-56 md:w-64 md:h-64 object-contain select-none" />
            <p className="mt-4 text-2xl md:text-4xl text-gray-900 font-extrabold">Let's correct the exercises you missed!</p>
          </div>
          <div className="mt-10 w-full max-w-2xl">
            <button
              onClick={() => navigate('/review-round')}
              className="w-full py-5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-2xl tracking-wide shadow-[0_8px_0_0_rgba(0,0,0,0.15)]"
            >
              RE-ATTEMPT
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Finish character above sentence (Duolingo-style) */}
          <img src={finishImg} alt="Finish" className="w-96 h-96 md:w-[28rem] md:h-[28rem] object-contain select-none mb-4" />
          <p className="mt-1 text-3xl md:text-4xl text-gray-900 font-extrabold max-w-4xl">You rocked this lesson. Ready for the next adventure?</p>
          <div className="mt-8">
            <button onClick={handleContinue} className="w-[10] py-6 px-8 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl hover:bg-blue-700 transition-colors shadow-[0_8px_0_0_rgba(0,0,0,0.15)] whitespace-nowrap">Continue Learning</button>
          </div>
        </>
      )}
    </div>
  );
};

export default LessonComplete;