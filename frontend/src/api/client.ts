// frontend/src/api/client.ts

import axios from "axios";
import { useAuthStore } from "../store/authStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

// Request interceptor to add the authentication token to every request.
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is an HTTP response error and has a response object
    if (error.response) {
      const { status, data } = error.response;
      const currentPath = window.location.pathname;

      // Specific handling for 403 Forbidden due to inactive subscription
      if (status === 403 && data && data.message === "Your organization's subscription is not active. Please renew to continue accessing features.") {
        console.warn("Subscription inactive, redirecting to resubscribe page.");
        // Only redirect if not already on the resubscribe page to prevent loops
        if (!currentPath.startsWith('/resubscribe')) {
            window.location.href = '/resubscribe?status=inactive';
        }
        return Promise.reject(error); // Reject the promise to stop further processing
      }
      // Generic handling for 401 Unauthorized (e.g., invalid token, session expired)
      else if (status === 401) {
        console.error("Authentication Error: The request was not authorized. Clearing auth state.");
        useAuthStore.getState().logout(); // Logout user (clears token, sets isAuthenticated to false)
        
        // Only perform a hard redirect if not already on a login/registration/public path
        // This prevents redirecting public visitors or creating redirect loops.
        if (!currentPath.startsWith('/login') && 
            !currentPath.startsWith('/register') && 
            !currentPath.startsWith('/forgot-password') && 
            !currentPath.startsWith('/reset-password') && 
            !currentPath.startsWith('/accept-agent-invite') &&
            !currentPath === '/') // Also don't redirect if on the root landing page
        {
          window.location.href = '/login?error=session_expired'; // Force a full page reload to login
        }
        return Promise.reject(error); // Reject the promise to stop further processing
      }
      
      // For any other HTTP error (e.g., 404, 500, etc.), just reject the promise.
      // The individual component or React Query will handle displaying the error.
      return Promise.reject(error);
    }
    
    // If there's no error.response (e.g., network error before server response), just reject.
    console.error("Network or unknown Axios error:", error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
