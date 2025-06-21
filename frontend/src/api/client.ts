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

      if (status === 401) {
        // Token invalid or expired - force logout to clear session
        console.error('API Error: 401 Unauthorized - Token expired or invalid.');
        logout(); // Clear auth state
        window.location.href = '/login?message=session_expired'; // Redirect to login page
      } else if (status === 403) {
        // Forbidden - access denied based on user role or subscription status
        console.error('API Error: 403 Forbidden - Access denied.', data.message);

        // Check if the message indicates a specific account or subscription issue
        if (data && typeof data.message === 'string') {
          if (data.message.includes('subscription is inactive')) {
            // Specific handling for inactive subscription
            window.location.href = '/dashboard/billing?status=subscription_inactive'; // Redirect to billing
          } else if (data.message.includes('account is inactive') || data.message.includes('account is suspended')) {
            // Specific handling for inactive/suspended user account
            window.location.href = '/login?status=account_inactive'; // Redirect to login with specific message
          } else {
            // General 403 for other reasons (e.g., insufficient role for specific action)
            // User remains logged in but is shown an access denied alert/message on current page
            // Or redirected to a safe dashboard overview
            window.location.href = '/dashboard/overview?status=access_denied';
          }
        } else {
          // Fallback for generic 403 without specific message
          window.location.href = '/dashboard/overview?status=access_denied';
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
