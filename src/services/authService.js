import axios from 'axios';

// The base URL of your backend API
const API_URL = 'http://localhost:5000/api/auth/';

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
