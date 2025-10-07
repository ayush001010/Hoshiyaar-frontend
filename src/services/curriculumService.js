import axios from 'axios';

// Prefer Vite proxy on localhost; use VITE_API_BASE or current origin in non-local envs
const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)/.test(window.location.hostname);
const API = isLocalhost ? '' : (import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' ? window.location.origin : ''));

const curriculumService = {
  listBoards() {
    return axios.get(`${API}/api/curriculum/boards`);
  },
  listSubjects(board = 'CBSE') {
    return axios.get(`${API}/api/curriculum/subjects`, { params: { board } });
  },
  listChapters(board = 'CBSE', subject = 'Science') {
    return axios.get(`${API}/api/curriculum/chapters`, { params: { board, subject } });
  },
  listUnits(chapterId) {
    return axios.get(`${API}/api/curriculum/units`, { params: { chapterId } });
  },
  listModules(chapterId) {
    return axios.get(`${API}/api/curriculum/modules`, { params: { chapterId } });
  },
  listModulesByUnit(unitId) {
    return axios.get(`${API}/api/curriculum/modules`, { params: { unitId } });
  },
  listItems(moduleId) {
    return axios.get(`${API}/api/curriculum/items`, { params: { moduleId } });
  },
};

export default curriculumService;


