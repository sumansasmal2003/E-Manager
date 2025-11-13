import axios from 'axios';

const api = axios.create({
  baseURL: 'https://e-manager-backend-6vwv.onrender.com/api', // Your backend URL
  // baseURL: 'http://localhost:5000/api', // Your backend URL
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
