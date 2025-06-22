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
  _hasHydrated: boolean; // New state to track hydration
  setHasHydrated: (state: boolean) => void; // Action to set hydration status
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false, // Initial state is not hydrated
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state
        });
      },
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      // This function runs once the state is restored from localStorage
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
