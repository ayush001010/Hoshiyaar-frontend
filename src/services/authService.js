import axios from 'axios';

// The base URL of your backend API
// In development, use same-origin so Vite proxy (see vite.config.js) forwards to http://localhost:5000
// In production, allow overriding with VITE_API_BASE, otherwise fall back to current origin
const BASE = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE || 'https://hoshiyaar-backend.onrender.com');
const API_URL = `${BASE}/api/auth/`;

// Debug logging
console.log('API_URL:', API_URL);
console.log('Environment:', import.meta.env.DEV ? 'development' : 'production');
console.log('BASE:', BASE);

// Register user (username-based)
const register = (userData) => {
  return axios.post(API_URL + 'register', userData);
};

// Login user with username
const login = (userData) => {
  return axios.post(API_URL + 'login', userData);
};

// Update onboarding selections
const updateOnboarding = (data) => {
  return axios.put(API_URL + 'onboarding', data);
};

// Update profile (alias to onboarding update for now)
const updateProfile = (data) => axios.put(API_URL + 'onboarding', data);

// Get user data
const getUser = (userId) => {
  return axios.get(API_URL + 'user/' + userId);
};

// Progress APIs
const getProgress = (userId) => axios.get(API_URL + 'progress/' + userId);
const updateProgress = (data) => axios.put(API_URL + 'progress', data);

// Username availability
const checkUsername = (username) => axios.get(API_URL + 'check-username', { params: { username } });

// Export the functions
const authService = {
  register,
  login,
  updateOnboarding,
  updateProfile,
  getUser,
  getProgress,
  updateProgress,
  checkUsername,
};

export default authService;
