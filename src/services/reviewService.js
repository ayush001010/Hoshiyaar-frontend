import axios from 'axios';

// Use proxy for local development
const API = import.meta.env.VITE_API_BASE || '';

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
