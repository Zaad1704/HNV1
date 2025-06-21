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

// Response Interceptor: Handle errors, especially 403 Forbidden
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Access the auth store outside of a React component
    const { logout } = useAuthStore.getState();

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Token invalid or expired - force logout
        console.error('API Error: 401 Unauthorized - Token expired or invalid.');
        logout(); // Clear auth state
        window.location.href = '/login?message=session_expired'; // Redirect to login
      } else if (status === 403) {
        // Forbidden - could be role-based or subscription-based
        console.error('API Error: 403 Forbidden - Access denied.');

        // Check if the message indicates a subscription issue
        if (data && typeof data.message === 'string' && data.message.includes('subscription is inactive')) {
          // Specific handling for inactive subscription
          window.location.href = '/dashboard/billing?message=subscription_inactive'; // Redirect to billing page
        } else {
          // General 403 for other reasons (e.g., insufficient role)
          window.location.href = '/dashboard/overview?message=access_denied'; // Redirect to dashboard with general denial
        }
      } else if (status >= 500) {
        // Server errors
        console.error(`API Error: ${status} Server Error`, data.message);
        // Optionally show a generic server error message to the user
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
