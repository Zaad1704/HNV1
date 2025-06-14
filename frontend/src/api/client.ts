import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// FIX: Changed VITE_API_BASE_URL to VITE_API_URL to match the variable in render.yaml
const baseURL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // FIX: Switched to a standard function to get the token, as Zustand hooks should be used in components.
    const token = useAuthStore.getState().user?.token; // Assuming token is on the user object
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
