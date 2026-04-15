import { StateCreator } from 'zustand';
import {
  AUTH_USER_KEY,
  clearAuthStorage,
  getAuthToken,
  setAuthToken,
} from '@/lib/api/auth-token';
import type { SessionUser } from '@/shared/types/auth';

function readPersisted(): {
  token: string | null;
  currentUser: SessionUser | null;
  isAuthenticated: boolean;
} {
  try {
    const token = getAuthToken();
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (token && raw) {
      return { token, currentUser: JSON.parse(raw) as SessionUser, isAuthenticated: true };
    }
  } catch {
    /* ignore */
  }
  return { token: null, currentUser: null, isAuthenticated: false };
}

export type { SessionUser };

export interface AuthSlice {
  token: string | null;
  currentUser: SessionUser | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: SessionUser) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  ...readPersisted(),
  setSession: (token, user) => {
    setAuthToken(token);
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch {
      /* ignore */
    }
    set({ token, currentUser: user, isAuthenticated: true });
  },
  logout: () => {
    clearAuthStorage();
    set({ token: null, currentUser: null, isAuthenticated: false });
  },
});
