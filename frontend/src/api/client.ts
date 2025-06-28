import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { rateLimiter } from '../utils/security';

// Get the API URL from environment or use production URL
const getApiUrl = () => {
  // Check if we're in development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5001/api';
  }
  // Use environment variable or fallback to production
  const viteApiUrl = (import.meta as any).env?.VITE_API_URL;
  return viteApiUrl || 'https://hnv.onrender.com/api';
};

const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': '1.0.0',
  },
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor with security enhancements
apiClient.interceptors.request.use((config) => {
  // Rate limiting check
  const url = config.url || '';
  if (!rateLimiter.isAllowed(url, 30, 60000)) {
    return Promise.reject(new Error('Rate limit exceeded'));
  }

  // Add auth token
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add security headers
  config.headers['X-Request-Time'] = Date.now().toString();
  
  return config;
});

// Response interceptor with enhanced error handling
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if user was authenticated before
      const { token } = useAuthStore.getState();
      if (token) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.error('Access forbidden');
    } else if (error.response?.status === 429) {
      console.error('Rate limit exceeded');
    }
    
    if (import.meta.env.DEV) {
      console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;