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
    if (error.response) {
      const { status, data } = error.response;
      const currentPath = window.location.pathname;

      if (status === 403 && data?.message === "Your organization's subscription is not active. Please renew to continue accessing features.") {
        if (!currentPath.startsWith('/resubscribe')) {
            window.location.href = '/resubscribe?status=inactive';
        }
        return Promise.reject(error);
      }
      else if (status === 401) {
        useAuthStore.getState().logout();
        
        // FIX: Prevent redirecting to login from public-but-auth-aware pages
        const isPublicAuthPage = currentPath.startsWith('/login') || 
                                 currentPath.startsWith('/register') || 
                                 currentPath.startsWith('/pricing') ||
                                 currentPath.startsWith('/payment-summary') ||
                                 currentPath.startsWith('/forgot-password') ||
                                 currentPath.startsWith('/reset-password') ||
                                 currentPath.startsWith('/accept-agent-invite') ||
                                 currentPath === '/';

        if (!isPublicAuthPage) {
          window.location.href = '/login?error=session_expired';
        }
        return Promise.reject(error);
      }
      
      return Promise.reject(error);
    }
    
    console.error("Network or unknown Axios error:", error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
