import axios from 'axios';

// In development, use Vite proxy (/api)
// In production, use VITE_API_BASE_URL/api or fallback
const baseURL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle unauthorized responses gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const currentPath = window.location.pathname;
    const isAuthRoute = currentPath.includes('/login') || 
                        currentPath.includes('/register') || 
                        currentPath.includes('/complete-profile') ||
                        currentPath.includes('/auth/callback');

    // Only redirect if 401 occurs outside of authentication pages
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default api;