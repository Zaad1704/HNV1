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
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void; // This action will be corrected
  login: (token: string, user: User) => void;
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
      
      // THE FIX: Ensure setToken also sets isAuthenticated correctly.
      // The user object will be fetched by the App.tsx useEffect hook.
      setToken: (token) => set({ token, user: null, isAuthenticated: !!token }),
      
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
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
