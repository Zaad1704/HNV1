// frontend/src/api/client.ts
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
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { logout } = useAuthStore.getState();

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401 || status === 403) {
        console.error(`API Error: ${status} - Access denied.`, data.message);
        logout(); // Clear auth state.
        // For 401 (session invalid/expired), force a hard redirect to login page.
        // For 403 (account/subscription inactive), ProtectedRoute will handle the redirect
        // after logout() is called, sending them to /login if not already on /resubscribe (which now works).
        if (status === 401) {
            window.location.href = '/login?message=session_expired';
        }
      } else if (status >= 500) {
        console.error(`API Error: ${status} Server Error`, data.message);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
