import axios from 'axios';
import { useAuthStore } from '../store/authStore'; // Corrected import with curly braces

// Use the environment variable for the base URL in production.
// This allows your code to work both locally and when deployed.
// The '/api' fallback is for local development with a proxy.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create a new Axios instance with the correct base URL
const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Axios Interceptor ---
// This automatically adds the authentication token to every request.
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
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
