import create from "zustand";
import { persist } from "zustand/middleware";

// Define your user type
type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  // ...add other fields as needed
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean; // Indicates if the auth state itself is loading/rehydrating
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false, // Initial state, will be managed externally in App.tsx
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      login: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
