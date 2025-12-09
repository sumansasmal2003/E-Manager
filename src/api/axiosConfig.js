import axios from 'axios';

// Use environment variable if available, otherwise fallback to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('eManagerUser'));

    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
