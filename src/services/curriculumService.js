import axios from 'axios';

// Use proxy for local development
const API = import.meta.env.VITE_API_BASE || '';

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
  listModules(chapterId) {
    return axios.get(`${API}/api/curriculum/modules`, { params: { chapterId } });
  },
  listItems(moduleId) {
    return axios.get(`${API}/api/curriculum/items`, { params: { moduleId } });
  },
};

export default curriculumService;


