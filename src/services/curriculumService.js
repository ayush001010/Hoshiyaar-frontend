import axios from 'axios';

// Prefer Vite proxy on localhost; use VITE_API_BASE or current origin in non-local envs
const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)/.test(window.location.hostname);
const API = isLocalhost ? '' : (import.meta.env.VITE_API_BASE || 'http://hoshi-backend-env.eba-t92ieqn2.ap-southeast-2.elasticbeanstalk.com');

// Centralized axios instance with sane defaults to avoid hanging requests
const http = axios.create({
  baseURL: API,
  timeout: 12000, // 12s timeout to fail fast and render fallbacks
  withCredentials: false,
});

const passOpts = (opts) => (opts && typeof opts === 'object' ? opts : {});

const curriculumService = {
  listBoards(opts) {
    return http.get(`/api/curriculum/boards`, passOpts(opts));
  },
  listSubjects(board = 'CBSE', opts) {
    return http.get(`/api/curriculum/subjects`, { params: { board }, ...passOpts(opts) });
  },
  listChapters(board = 'CBSE', subject = 'Science', extraParams = {}, opts) {
    // extraParams can include { userId, classTitle }
    return http.get(`/api/curriculum/chapters`, { params: { board, subject, ...(extraParams || {}) }, ...passOpts(opts) });
  },
  listUnits(chapterId, opts) {
    return http.get(`/api/curriculum/units`, { params: { chapterId }, ...passOpts(opts) });
  },
  listModules(chapterId, opts) {
    return http.get(`/api/curriculum/modules`, { params: { chapterId }, ...passOpts(opts) });
  },
  listModulesByUnit(unitId, opts) {
    return http.get(`/api/curriculum/modules`, { params: { unitId }, ...passOpts(opts) });
  },
  listItems(moduleId, opts) {
    return http.get(`/api/curriculum/items`, { params: { moduleId }, ...passOpts(opts) });
  },
};

export default curriculumService;


