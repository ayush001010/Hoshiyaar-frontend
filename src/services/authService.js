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

// Export the functions
const authService = {
  register,
  login,
};

export default authService;
