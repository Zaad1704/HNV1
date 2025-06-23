import create from "zustand";
import { persist } from "zustand/middleware";

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
  login: (token: string, user: User) => void; // We can simplify this but will leave for now
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      // FIX: Both login and setToken will ONLY set the token. 
      // The user object will be fetched separately by App.tsx to avoid race conditions.
      setToken: (token) => set({ token, user: null, isAuthenticated: !!token }),
      
      login: (token, user) =>
        set({
          token,
          user, // For standard login, we can set the user immediately
          isAuthenticated: true,
        }),
      logout: () => {
        // Clear everything on logout
        localStorage.removeItem("auth-storage");
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token }), // Only persist the token
    }
  )
);
