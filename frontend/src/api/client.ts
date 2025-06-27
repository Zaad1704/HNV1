// Response interceptor with enhanced error handling
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // FIX: Only redirect if the user is on a protected page
      if (window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/admin')) {
          useAuthStore.getState().logout();
          window.location.href = '/login'; 
      } else {
          // For public pages, just clear the token to prevent repeated failed requests
          useAuthStore.getState().logout();
      }
    } else if (error.response?.status === 403) {
      console.error('Access forbidden');
    } else if (error.response?.status === 429) {
      console.error('Rate limit exceeded');
    }
    
    if (import.meta.env.DEV) {
      console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    }
    
    return Promise.reject(error);
  }
);
