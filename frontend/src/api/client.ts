// frontend/src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore'; // Import auth store

const baseURL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token to outgoing requests
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

// Response Interceptor: Handle errors, especially 401 Unauthorized and 403 Forbidden
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Access the auth store outside of a React component
    const { logout } = useAuthStore.getState();

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401 || status === 403) {
        // Token invalid/expired (401) or Forbidden (403 - e.g., inactive account/subscription)
        // In both cases, the user's session is effectively invalid for protected content.
        console.error(`API Error: ${status} - Access denied.`, data.message);
        logout(); // Clear auth state. This will cause ProtectedRoute to redirect to /login.
        // DO NOT use window.location.href here for 403. Let React Router handle navigation.
        // For 401, a specific redirect to login with a message can be helpful for debugging.
        if (status === 401) {
            window.location.href = '/login?message=session_expired'; // Direct hard reload for session expiry
        }
      } else if (status >= 500) {
        // Server errors
        console.error(`API Error: ${status} Server Error`, data.message);
        // You might want to display a temporary notification to the user about a server issue.
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
