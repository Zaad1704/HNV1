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

// FIX: The response interceptor is simplified to prevent redirect loops.
// The main application logic in App.tsx will now handle logging out
// when the /api/auth/me call fails.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is a 401, we will just reject the promise.
    // The component that made the API call can decide how to handle it.
    // This prevents the entire application from crashing.
    if (error.response && error.response.status === 401) {
      console.error("Authentication Error: The request was not authorized.");
      // We can optionally log the user out here if their token is invalid,
      // which is a safe operation.
      // useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
