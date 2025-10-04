import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import authService from '../../../services/authService.js';
import Welcome from './Welcome.jsx';
import BoardSelect from '../selectors/BoardSelect.jsx';
import SubjectSelect from '../selectors/SubjectSelect.jsx';
import ChapterSelect from '../selectors/ChapterSelect.jsx';
import LearnDashboard from './LearnDashboard.jsx'; // Import the final dashboard component
import SimpleLoading from '../../ui/SimpleLoading.jsx';

const Learn = () => {
  const [step, setStep] = useState(1);
  // Add state here to store all the user's choices
  const [onboardingData, setOnboardingData] = useState({
    board: null,
    subject: null,
    chapter: null, // Add chapter to state
  });
  const { user, loading } = useAuth();

  const getScopedKeys = (uid) => ({
    local: `learnOnboarded_${uid}`,
    session: `learnWasOnDashboard_${uid}`,
  });

  const nextStep = () => {
    setStep(prevStep => {
      const next = prevStep + 1;
      if (next >= 5 && user?._id) {
        const keys = getScopedKeys(user._id);
        try { localStorage.setItem(keys.local, 'true'); } catch (_) {}
        try { sessionStorage.setItem(keys.session, 'true'); } catch (_) {}
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
    if (step === 5 && user?._id) {
      const keys = getScopedKeys(user._id);
      try { sessionStorage.setItem(keys.session, 'true'); } catch (_) {}
      try { localStorage.setItem(keys.local, 'true'); } catch (_) {}
    }
  }, [step, user]);

  // On mount, decide based on user.board and persisted state; avoid welcome flash
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        if (loading) {
          return;
        }
        if (!user?._id) return;

        const params = new URLSearchParams(window.location.search);
        const go = params.get('go');

        const keys = getScopedKeys(user._id);
        let localFlag = false;
        try {
          localFlag = (localStorage.getItem(keys.local) === 'true') || (sessionStorage.getItem(keys.session) === 'true');
        } catch (_) {}

        const hasUserSelections = Boolean(user.board) && Boolean(user.subject) && Boolean(user.chapter);

        // First-time user with no selections and no scoped flags: start onboarding
        if (!go && !user.onboardingCompleted && !localFlag && !hasUserSelections) {
          setStep(1);
          return;
        }

        // Otherwise go to dashboard
        setOnboardingData({
          board: user.board ?? onboardingData.board,
          subject: user.subject ?? onboardingData.subject,
          chapter: user.chapter ?? onboardingData.chapter,
        });
        setStep(5);
      } catch (_) {
        // ignore storage errors
      }
    };

    checkOnboardingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    onboardingCompleted: true,
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
        return <LearnDashboard onboardingData={onboardingData} />;
      default:
        return <LearnDashboard onboardingData={onboardingData} />;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {loading ? <SimpleLoading /> : renderStep()}
    </div>
  );
};

export default Learn;

