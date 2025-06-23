import create from "zustand";
import { persist } from "zustand/middleware";

// Define your user type
type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => {
        // On logout, clear everything from state and storage
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage", // The key in localStorage
      // FIX: Only persist the 'token'. The user object will be fetched on load.
      // This prevents issues with stale user data causing crashes.
      partialize: (state) => ({ token: state.token }),
    }
  )
);
