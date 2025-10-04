import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import authService from '../../services/authService.js';
import heroChar from '../../assets/images/heroChar.png';
import BackButton from '../ui/BackButton.jsx';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', board: '', className: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mascotSrc, setMascotSrc] = useState(heroChar);

  // Fetch user details from DB (ignore subject/chapter), fallback to 'Not Defined' where absent
  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      try {
        const res = await authService.getUser(user._id);
        const dbUser = res?.data || {};
        setForm({
          name: (dbUser.name ?? 'Not Defined'),
          email: (dbUser.email ?? 'Not Defined'),
          phone: (dbUser.phone ?? 'Not Defined'),
          board: (dbUser.board ?? 'Not Defined'),
          className: (dbUser.class ?? dbUser.className ?? 'Not Defined'),
        });
      } catch (_) {
        // Fallback to auth context if fetch fails
        setForm({
          name: (user?.name ?? 'Not Defined'),
          email: (user?.email ?? 'Not Defined'),
          phone: (user?.phone ?? 'Not Defined'),
          board: (user?.board ?? 'Not Defined'),
          className: (user?.class ?? user?.className ?? 'Not Defined'),
        });
      }
    };
    load();
  }, [user]);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!user?._id) return;
    setSaving(true);
    try {
      await authService.updateOnboarding({
        userId: user._id,
        board: form.board === 'Not Defined' ? '' : form.board,
        subject: user.subject,
        chapter: user.chapter,
        name: form.name === 'Not Defined' ? '' : form.name,
        phone: form.phone === 'Not Defined' ? '' : form.phone,
        className: form.className === 'Not Defined' ? '' : form.className,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (_) {}
    setSaving(false);
  };

  const handleLogout = () => {
    try { logout?.(); } catch (_) {}
    try { window.location.href = '/'; } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E6F2FF] to-[#F7FBFF] py-10 px-6 relative">
      <BackButton className="fixed left-4 top-4" />
      <div className="max-w-5xl mx-auto bg-white border-4 border-blue-200 rounded-3xl shadow-[0_12px_0_0_rgba(0,0,0,0.10)] p-8 relative overflow-hidden">
        {/* Top row: Title and Logout */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700">Edit Profile</h1>
          <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-red-500 text-white font-extrabold">Logout</button>
        </div>
        {/* Mascot */}
        <img src={mascotSrc} alt="Mascot" className="hidden md:block absolute -right-4 bottom-2 w-44 h-44 object-contain opacity-95 pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-0 md:pr-28">
          <label className="block">
            <span className="text-sm font-bold text-gray-700">Name</span>
            <input placeholder={form.name || 'Not Defined'} value={form.name} onChange={e=>update('name', e.target.value)} className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:outline-none focus:border-blue-400" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-gray-700">Email Id</span>
            <input placeholder={form.email || 'Not Defined'} value={form.email} disabled className="mt-1 w-full px-4 py-3 rounded-2xl border-2 bg-gray-50 border-blue-200" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-gray-700">Phone number</span>
            <input placeholder={form.phone || 'Not Defined'} value={form.phone} onChange={e=>update('phone', e.target.value)} className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:outline-none focus:border-blue-400" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-gray-700">Board</span>
            <input placeholder={form.board || 'Not Defined'} value={form.board} onChange={e=>update('board', e.target.value)} className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:outline-none focus:border-blue-400" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-gray-700">Class</span>
            <input placeholder={form.className || 'Not Defined'} value={form.className} onChange={e=>update('className', e.target.value)} className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:outline-none focus:border-blue-400" />
          </label>
        </div>
        <div className="mt-8 text-center">
          <button onClick={handleSave} disabled={saving} className="px-10 py-4 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white text-xl font-extrabold shadow-[0_10px_0_0_rgba(0,0,0,0.15)] disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saved && <div className="mt-3 text-green-700 font-bold">Saved!</div>}
        </div>
      </div>
    </div>
  );
}
