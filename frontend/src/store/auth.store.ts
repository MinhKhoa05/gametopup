import { useSyncExternalStore } from 'react';
import type { User } from '../types';

export type AuthMode = 'login' | 'register';

export type AuthFormState = {
  displayName: string;
  email: string;
  password: string;
};

type AuthState = {
  authForm: AuthFormState;
  authLoading: boolean;
  authMode: AuthMode;
  isAuthenticated: boolean;
  user: User | null;
};

function createInitialState(): AuthState {
  return {
    authForm: {
      displayName: '',
      email: 'customer01@gametopup.com',
      password: 'Password123!',
    },
    authLoading: true,
    authMode: 'login',
    isAuthenticated: false,
    user: null,
  };
}

let state = createInitialState();
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) listener();
}

function setState(partial: Partial<AuthState> | ((current: AuthState) => AuthState)) {
  state = typeof partial === 'function' ? partial(state) : { ...state, ...partial };
  emitChange();
}

function setUser(user: User | null) {
  setState({ user, isAuthenticated: Boolean(user) });
}

function setAuthMode(authMode: AuthMode) {
  setState({ authMode });
}

function setAuthForm(authForm: AuthFormState) {
  setState({ authForm });
}

function setAuthLoading(authLoading: boolean) {
  setState({ authLoading });
}

function resetAuthState() {
  state = createInitialState();
  state.authLoading = false;
  emitChange();
}

function updateProfile(displayName: string) {
  setState((current) => ({
    ...current,
    user: current.user ? { ...current.user, displayName } : current.user,
  }));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getState() {
  return state;
}

export function useAuthStore<T>(selector: (state: AuthState) => T) {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

export const authStore = {
  getState,
  resetAuthState,
  setAuthForm,
  setAuthLoading,
  setAuthMode,
  setUser,
  updateProfile,
};
