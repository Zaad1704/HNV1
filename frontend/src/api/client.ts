import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { logout } = useAuthStore.getState();
    if (error.response) {
      const { status, config } = error.response;
      // Only logout for protected API calls, not for /translate or public endpoints
      if (
        (status === 401 || status === 403) &&
        !(config.url && config.url.startsWith('/translate'))
      ) {
        logout();
        if (status === 401) window.location.href = '/login?message=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
