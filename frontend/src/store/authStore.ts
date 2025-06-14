import { create } from "zustand";

// This defines the shape of the User object we get from the backend
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// This defines the complete state of our store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  // Sets the user object in the store
  setUser: (user) => set({ user }),

  // Called after a successful login or registration
  login: (token) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },

  // Clears the session
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
