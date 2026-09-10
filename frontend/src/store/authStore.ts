import { create } from 'zustand';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  // One-Login shared authentication foundation (Phase 6): true once App has
  // finished checking whether the shared Main JWT cookie already authenticates
  // this browser. PrivateRoute waits on this instead of redirecting purely off
  // localStorage token presence.
  authChecked: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const storedUser = localStorage.getItem('auth_user');

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? (JSON.parse(storedUser) as User) : null,
  token: localStorage.getItem('access_token'),
  authChecked: false,
  setAuth: (user, token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user, token });
  },
  setUser: (user) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null });
  },
}));
