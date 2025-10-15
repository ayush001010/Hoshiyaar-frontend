import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import BoardSelect from './BoardSelect.jsx';
import SubjectSelect from './SubjectSelect.jsx';
import ChapterSelect from './ChapterSelect.jsx';

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [data, setData] = useState({ board: '', subject: '', chapter: '' });

  const updateData = (partial) => setData((d) => ({ ...d, ...(partial || {}) }));

  const saveAndContinue = async () => {
    try {
      const authMod = await import('../../../services/authService.js');
      const svc = authMod.default;
      if (user?._id) {
        await svc.updateProfile({
          userId: user._id,
          board: data.board,
          subject: data.subject,
          chapter: data.chapter,
        });
      }
    } catch (_) {}
    try { login?.({ ...(user || {}), ...data, onboardingCompleted: true }); } catch (_) {}
    navigate('/learn', { replace: true });
  };

  if (!data.board) {
    return (
      <BoardSelect
        updateData={updateData}
        onContinue={() => {}}
        onBack={() => navigate('/login')}
      />
    );
  }
  if (!data.subject) {
    return (
      <SubjectSelect
        selectedBoard={data.board}
        updateData={updateData}
        onContinue={() => {}}
        onBack={() => updateData({ board: '' })}
      />
    );
  }
  if (!data.chapter) {
    return (
      <ChapterSelect
        updateData={updateData}
        onContinue={() => saveAndContinue()}
        onBack={() => updateData({ subject: '' })}
      />
    );
  }
  return null;
}


