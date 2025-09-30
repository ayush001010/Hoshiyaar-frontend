import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import authService from '../../services/authService.js';
import Welcome from './Welcome.jsx';
import BoardSelect from './BoardSelect.jsx';
import SubjectSelect from './SubjectSelect.jsx';
import ChapterSelect from './ChapterSelect.jsx';
import LearnDashboard from './LearnDashboard.jsx'; // Import the final dashboard component
import SimpleLoading from '../SimpleLoading.jsx';

const Learn = () => {
  const [step, setStep] = useState(1);
  // Add state here to store all the user's choices
  const [onboardingData, setOnboardingData] = useState({
    board: null,
    subject: null,
    chapter: null, // Add chapter to state
  });
  const { user, loading } = useAuth();

  const nextStep = () => {
    setStep(prevStep => {
      const next = prevStep + 1;
      if (next >= 5) {
        try { localStorage.setItem('learnOnboarded', 'true'); } catch (_) {}
      }
      return next;
    });
  };

  const prevStep = () => {
    setStep(prevStep => prevStep - 1);
  };

  // Function to save data from child components
  const updateOnboardingData = (data) => {
      setOnboardingData(prevData => ({ ...prevData, ...data }));
  };

  // Persist dashboard state across refreshes
  useEffect(() => {
    if (step === 5) {
      try { sessionStorage.setItem('learnWasOnDashboard', 'true'); } catch (_) {}
    }
  }, [step]);

  // On mount, decide based on user.board and persisted state; avoid welcome flash
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        console.log('=== ONBOARDING DEBUG START ===');
        console.log('Loading state:', loading);
        console.log('Current user object:', user);
        console.log('User ID:', user?._id);
        
        // Wait for auth to load
        if (loading) {
          console.log('Auth still loading, waiting...');
          return;
        }
        // If not logged in, do nothing here
        if (!user?._id) return;

        // Allow forcing dashboard via query (?go=dashboard)
        const params = new URLSearchParams(window.location.search);
        const go = params.get('go');

        // If onboardingCompleted true or query requests dashboard -> dashboard; else -> onboarding once
        if (user.onboardingCompleted || go === 'dashboard') {
          setOnboardingData({
            board: user.board ?? null,
            subject: user.subject ?? null,
            chapter: user.chapter ?? null,
          });
          setStep(5);
          return;
        }

        // Otherwise start onboarding once (sign up flow) with Welcome
        setStep(1);
      } catch (_) {
        // ignore storage errors
      }
    };

    checkOnboardingStatus();
  }, [user, loading]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Welcome onContinue={nextStep} />;
      case 2:
        return <BoardSelect onContinue={nextStep} onBack={prevStep} updateData={updateOnboardingData} />;
      case 3:
        return <SubjectSelect onContinue={nextStep} onBack={prevStep} updateData={updateOnboardingData} selectedBoard={onboardingData.board || 'CBSE'} />;
      case 4:
        return (
          <ChapterSelect
            onContinue={async () => {
              // Persist onboarding selections now that we have all three
              try {
                if (user?._id) {
                  await authService.updateOnboarding({
                    userId: user._id,
                    board: onboardingData.board,
                    subject: onboardingData.subject,
                    chapter: onboardingData.chapter,
                  });
                }
              } catch (e) {
                // non-blocking
              }
              nextStep();
            }}
            onBack={prevStep}
            updateData={updateOnboardingData}
          />
        );
      case 5:
        // After chapter selection, show the main dashboard
        return <LearnDashboard onboardingData={onboardingData} />;
      default:
        // If the user gets past the last step, just show the dashboard
        return <LearnDashboard onboardingData={onboardingData} />;
    }
  };
  
  // Do not short-circuit to dashboard here; respect `step` decided above
  
  // Unified full-page white layout across onboarding and dashboard
  return (
    <div className="bg-white min-h-screen">
      {loading ? <SimpleLoading /> : renderStep()}
    </div>
  );
};

export default Learn;

