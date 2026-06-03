import { create } from 'zustand';
import type { AuthFormState, AuthMode, AuthStatus, AuthUserSnapshot } from '../types/auth.types';
import type { User } from '../types';

export type { AuthFormState, AuthMode, AuthStatus, AuthUserSnapshot } from '../types/auth.types';

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
  resetAuthState: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  authForm: {
    displayName: '',
    email: 'customer01@gametopup.com',
    password: 'Password123!',
  },
  authLoading: false,
  authMode: 'login',
  authStatus: 'unknown',
  user: null,
  userSnapshot: null,

  setAuthForm: (authForm) => set({ authForm }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setAuthMode: (authMode) => set({ authMode }),
  setAuthStatus: (authStatus) => set({ authStatus }),

  setUser: (user) =>
    set({ user }),

  setUserSnapshot: (userSnapshot) => {
    set({ userSnapshot });
  },

  setGuest: () => {
    set({
      authLoading: false,
      authStatus: 'guest',
      user: null,
      userSnapshot: null,
    });
  },

  resetAuthState: () => {
    set({
      authLoading: false,
      authMode: 'login',
      authStatus: 'unknown',
      user: null,
      userSnapshot: null,
    });
  },
}));

export const authActions = {
  resetAuthState: () => useAuthStore.getState().resetAuthState(),
  setAuthForm: (authForm: AuthFormState) => useAuthStore.getState().setAuthForm(authForm),
  setAuthLoading: (authLoading: boolean) => useAuthStore.getState().setAuthLoading(authLoading),
  setAuthMode: (authMode: AuthMode) => useAuthStore.getState().setAuthMode(authMode),
  setAuthStatus: (authStatus: AuthStatus) => useAuthStore.getState().setAuthStatus(authStatus),
  setGuest: () => useAuthStore.getState().setGuest(),
  setUser: (user: User | null) => useAuthStore.getState().setUser(user),
  setUserSnapshot: (userSnapshot: AuthUserSnapshot | null) => useAuthStore.getState().setUserSnapshot(userSnapshot),
};
