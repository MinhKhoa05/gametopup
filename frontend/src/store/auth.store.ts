import { create } from 'zustand';
import type { AuthFormState, AuthMode, AuthStatus, AuthUserSnapshot } from '../types/auth.types';
import type { User } from '../types';

export type { AuthFormState, AuthMode, AuthStatus, AuthUserSnapshot } from '../types/auth.types';

const AUTH_SNAPSHOT_KEY = 'gametopup.auth.snapshot';
const readSnapshot = (): AuthUserSnapshot | null => {
  try { return JSON.parse(window.localStorage.getItem(AUTH_SNAPSHOT_KEY) || 'null'); } catch { return null; }
};
const writeSnapshot = (s: AuthUserSnapshot | null) => {
  try { if (s) window.localStorage.setItem(AUTH_SNAPSHOT_KEY, JSON.stringify(s)); else window.localStorage.removeItem(AUTH_SNAPSHOT_KEY); } catch {}
};

type AuthStore = {
  authForm: AuthFormState;
  authLoading: boolean;
  authMode: AuthMode;
  authStatus: AuthStatus;
  user: User | null;
  userSnapshot: AuthUserSnapshot | null;
  setAuthForm: (authForm: AuthFormState) => void;
  setAuthLoading: (authLoading: boolean) => void;
  setAuthMode: (authMode: AuthMode) => void;
  setAuthStatus: (authStatus: AuthStatus) => void;
  setUser: (user: User | null) => void;
  setUserSnapshot: (userSnapshot: AuthUserSnapshot | null) => void;
  setGuest: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  authForm: { displayName: '', email: 'customer01@gametopup.com', password: 'Password123!' },
  authLoading: false,
  authMode: 'login',
  authStatus: 'unknown',
  user: null,
  userSnapshot: readSnapshot(),
  setAuthForm: (authForm) => set({ authForm }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setAuthMode: (authMode) => set({ authMode }),
  setAuthStatus: (authStatus) => set({ authStatus }),
  setUser: (user) => set({ user }),
  setUserSnapshot: (userSnapshot) => { writeSnapshot(userSnapshot); set({ userSnapshot }); },
  setGuest: () => {
    writeSnapshot(null);
    set((state) => {
      if (
        state.authLoading === false &&
        state.authStatus === 'guest' &&
        state.user === null &&
        state.userSnapshot === null
      ) {
        return state;
      }

      return { authLoading: false, authStatus: 'guest', user: null, userSnapshot: null };
    });
  },
}));
