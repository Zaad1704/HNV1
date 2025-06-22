import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Create an axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // If your API uses HTTP-only cookies
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If 401 and not already retried, try to refresh token (if implemented)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      // If you have a refresh endpoint, attempt here
      // const refreshToken = ... (from store/localStorage)
      // try {
      //   const resp = await axios.post("/auth/refresh", { refreshToken });
      //   useAuthStore.getState().setToken(resp.data.token);
      //   originalRequest.headers["Authorization"] = `Bearer ${resp.data.token}`;
      //   return apiClient(originalRequest);
      // } catch (e) {
      //   useAuthStore.getState().logout();
      //   window.location.href = "/login";
      //   return Promise.reject(e);
      // }
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
