import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { rateLimiter } from '../utils/security';

// Get the API URL with proper detection
const getApiUrl = () => {
  // Check environment variable first
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl) {
    console.log('Using API URL from environment:', viteApiUrl);
    return viteApiUrl.endsWith('/api') ? viteApiUrl : `${viteApiUrl}/api`;
  }
  
  // Force production URL when not on localhost
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const prodUrl = 'https://hnv.onrender.com/api';
    console.log('Using production API URL:', prodUrl);
    return prodUrl;
  }
  
  // Development fallback
  const devUrl = 'http://localhost:5001/api';
  console.log('Using development API URL:', devUrl);
  return devUrl;
};

const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': '1.0.0',
  },
  timeout: 15000, // Reduced timeout for better UX
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
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check internet connection or server availability');
      error.userMessage = 'Network connection error. Please check your internet connection.';
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      error.userMessage = 'Request timed out. Server may be starting up.';
    }
    
    // Handle HTTP status codes
    if (error.response?.status === 401) {
      const { token, isAuthenticated } = useAuthStore.getState();
      // Only auto-logout if user was previously authenticated
      if (token && isAuthenticated) {

        useAuthStore.getState().logout();
        // Don't redirect immediately, let the component handle it
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?session=expired';
          }
        }, 100);
      }
    } else if (error.response?.status === 403) {
      // Don't auto-logout on 403 - might be subscription or permission issue
      console.warn('Access forbidden:', error.response?.data?.message);
      error.userMessage = error.response?.data?.message || 'Access denied';
    } else if (error.response?.status === 429) {
      console.error('Rate limit exceeded');
      error.userMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.status);
      error.userMessage = 'Server error. Please try again later.';
    } else if (error.response?.status === 404) {
      console.warn('Resource not found:', error.config?.url);
      error.userMessage = 'Requested data not found.';
    }
    
    if (import.meta.env.DEV) {
      console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.response?.data?.message,
        code: error.code
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;