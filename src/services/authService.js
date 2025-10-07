import axios from 'axios';

// The base URL of your backend API
// For local development: use empty string to leverage Vite proxy
// For production: use the full backend URL
const BASE = import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' ? window.location.origin : '');
const API_URL = `${BASE}/api/auth/`;

// Debug logging
console.log('API_URL:', API_URL);
console.log('Environment:', import.meta.env.DEV ? 'development' : 'production');
console.log('BASE:', BASE);

// Register user
const register = (userData) => {
  return axios.post(API_URL + 'register', userData);
};

// Login user
const login = (userData) => {
  return axios.post(API_URL + 'login', userData);
};

// Update onboarding selections
const updateOnboarding = (data) => {
  return axios.put(API_URL + 'onboarding', data);
};

// Get user data
const getUser = (userId) => {
  return axios.get(API_URL + 'user/' + userId);
};

// Progress APIs
const getProgress = (userId) => axios.get(API_URL + 'progress/' + userId);
const updateProgress = (data) => axios.put(API_URL + 'progress', data);

// Export the functions
const authService = {
  register,
  login,
  updateOnboarding,
  getUser,
  getProgress,
  updateProgress,
};

export default authService;
