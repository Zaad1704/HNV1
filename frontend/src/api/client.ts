import axios from "axios";
import { useOrgStore } from "../store/orgStore";

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// Interceptor: attach X-Org-Id from Zustand store
api.interceptors.request.use(
  (config) => {
    const org = useOrgStore.getState().currentOrg;
    if (org && org._id) {
      config.headers = config.headers || {};
      config.headers["X-Org-Id"] = org._id;
    }
    return config;
  },
  (error) => Promise.reject(error)
);