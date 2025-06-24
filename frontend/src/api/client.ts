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
    // Check if the error is an HTTP response error
    if (error.response) {
      const { status, data } = error.response;

      // Handle 403 Forbidden specifically for inactive subscription
      if (status === 403 && data && data.message === "Your organization's subscription is not active. Please renew to continue accessing features.") {
        console.warn("Subscription inactive, redirecting to resubscribe page.");
        // Perform a full page redirect to the resubscribe page.
        // We pass the status as a query param so the page knows the context.
        window.location.href = '/resubscribe?status=inactive';
        // Reject the promise to stop further processing for the original request
        return Promise.reject(error); 
      }
      // Handle generic 401 Unauthorized errors (e.g., invalid token, user not found)
      else if (status === 401) {
        console.error("Authentication Error: The request was not authorized. Logging out.");
        useAuthStore.getState().logout(); // Logout user
        // Redirect to login page to prevent being stuck on a blank dashboard.
        // Check current path to avoid redirect loops if already on login/public page.
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && !window.location.pathname.startsWith('/accept-agent-invite')) {
          window.location.href = '/login?error=unauthorized';
        }
        return Promise.reject(error);
      }
      // For any other HTTP error, just reject the promise
      return Promise.reject(error);
    }
    // If no response (e.g., network error before server response), just reject
    return Promise.reject(error);
  }
);

export default apiClient;
