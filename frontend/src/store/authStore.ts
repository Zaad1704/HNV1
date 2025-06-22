import create from "zustand";
import { persist } from "zustand/middleware";

// Define a more complete User type to match the backend response
type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: {
    _id: string;
    name: string;
    branding?: {
      companyName?: string;
    }
  };
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (token: string, user: User) => void; // Expects both token and user
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      // The login action now correctly sets both token and user
      login: (token, user) => set({
        token,
        user,
        isAuthenticated: true,
      }),
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: "auth-storage", 
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
