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

// Response interceptor to handle global errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const currentPath = window.location.pathname;

      // Handle 403 Forbidden for inactive subscriptions
      if (status === 403 && data?.message === "Your organization's subscription is not active. Please renew to continue accessing features.") {
        if (!currentPath.startsWith('/resubscribe')) {
            window.location.href = '/resubscribe?status=inactive';
        }
        return Promise.reject(error);
      }
      // Handle 401 Unauthorized (e.g., expired token)
      else if (status === 401) {
        useAuthStore.getState().logout();
        
        // --- THIS IS THE FIX ---
        // We define a list of public paths where a user should NOT be redirected away from.
        // This prevents the redirect loop when an inactive user tries to view the pricing page.
        const isPublicAuthPage = currentPath.startsWith('/login') || 
                                 currentPath.startsWith('/register') || 
                                 currentPath.startsWith('/pricing') ||
                                 currentPath.startsWith('/payment-summary') ||
                                 currentPath.startsWith('/forgot-password') ||
                                 currentPath.startsWith('/reset-password') ||
                                 currentPath.startsWith('/accept-agent-invite') ||
                                 currentPath === '/';

        // Only redirect to login if the user is not already on one of these public pages.
        if (!isPublicAuthPage) {
          window.location.href = '/login?error=session_expired';
        }
        return Promise.reject(error);
      }
      
      // For any other error, just pass it along
      return Promise.reject(error);
    }
    
    console.error("Network or unknown Axios error:", error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
