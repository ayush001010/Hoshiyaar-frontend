import axios from 'axios';

// Prefer localhost while developing to avoid undeployed routes on hosted env
const API = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ? 'http://localhost:5000'
  : (import.meta.env.VITE_API_BASE || '');

const reviewService = {
  async listIncorrect(userId, moduleId, chapterId) {
    const res = await axios.get(`${API}/api/review/incorrect`, { params: { userId, moduleId, chapterId } });
    return res.data || [];
  },
  async saveIncorrect({ userId, questionId, moduleId, chapterId }) {
    const payload = { userId, questionId };
    if (moduleId) payload.moduleId = String(moduleId);
    if (chapterId) payload.chapterId = String(chapterId);
    const res = await axios.post(`${API}/api/review/incorrect`, payload);
    return res.data;
  }
};

export default reviewService;
