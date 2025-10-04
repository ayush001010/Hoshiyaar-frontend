import React, { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import heroChar from '../../../assets/images/heroChar.png';

// A placeholder for the character image. You can replace this with your actual image.
const CharacterPlaceholder = () => (
    <div className="w-48 h-48 rounded-2xl flex items-center justify-center">
        <img src={heroChar} alt="Hoshi" className="w-48 h-48 object-contain" />
    </div>
);

const Welcome = ({ onContinue }) => {
    const { user } = useAuth(); // Get user info to display their name
    const navigate = useNavigate();

    useEffect(() => {
        if (user?._id && (user?.onboardingCompleted || (user?.board && user?.subject))) {
            navigate('/learn', { replace: true });
        }
    }, [user, navigate]);

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
            {/* Header bar */}
            <div className="bg-duo-blue text-white px-6 py-5 md:px-8 md:py-6 flex items-center gap-4 shadow-[0_10px_0_0_rgba(0,0,0,0.08)]">
                <div>
                    <p className="font-extrabold text-2xl md:text-3xl">Welcome</p>
                    <p className="opacity-90 text-base md:text-lg">Hi {user?.name || 'there'}, I'm Hoshi!</p>
                </div>
            </div>

            {/* Main content area with speech bubble */}
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                <div className="relative">
                    {/* Speech bubble */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white border-2 border-gray-200 px-5 py-3 rounded-2xl shadow-md text-lg md:text-xl">
                        Hi, I'm Hoshi
                    </div>
                    <div className="w-60 h-60 md:w-72 md:h-72 rounded-2xl flex items-center justify-center">
                        <img src={heroChar} alt="Hoshi" className="w-full h-full object-contain" />
                    </div>
                    <p className="mt-6 text-xl md:text-2xl font-extrabold text-blue-700">Let's start your learning journey!</p>
                </div>
            </div>

            {/* Footer with Continue button */}
            <div className="border-t pt-6 px-6 pb-6 flex justify-end">
                <button 
                    onClick={onContinue}
                    className="bg-green-600 text-white font-extrabold py-5 px-12 rounded-xl text-lg md:text-xl hover:bg-green-700 transition-colors shadow-[0_6px_0_0_rgba(0,0,0,0.15)]"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default Welcome;
