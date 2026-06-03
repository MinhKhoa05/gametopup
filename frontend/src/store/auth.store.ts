import { useSyncExternalStore } from 'react';
import type { User } from '../types';

export type AuthMode = 'login' | 'register';

export type AuthStatus = 'unknown' | 'checking' | 'authenticated' | 'guest';

export type AuthFormState = {
  displayName: string;
  email: string;
  password: string;
};

export type AuthUserSnapshot = {
  id: number;
  avatarUrl?: string;
  displayName?: string;
  role?: User['role'];
};

type AuthState = {
  authForm: AuthFormState;
  authInitialized: boolean;
  authLoading: boolean;
  authMode: AuthMode;
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  user: User | null;
  userSnapshot: AuthUserSnapshot | null;
};

const AUTH_SNAPSHOT_KEY = 'gametopup.auth.snapshot';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readSnapshot(): AuthUserSnapshot | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(AUTH_SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as AuthUserSnapshot) : null;
  } catch {
    return null;
  }
}

function writeSnapshot(snapshot: AuthUserSnapshot | null) {
  if (!canUseStorage()) return;

  try {
    if (snapshot) window.localStorage.setItem(AUTH_SNAPSHOT_KEY, JSON.stringify(snapshot));
    else window.localStorage.removeItem(AUTH_SNAPSHOT_KEY);
  } catch {
    // Best-effort persistence only.
  }
}

function snapshotFromUser(user: User | null): AuthUserSnapshot | null {
  if (!user) return null;

  return {
    id: user.id,
    displayName: user.displayName ?? user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };
}

function isSameAuthUser(left: User | AuthUserSnapshot | null, right: User | AuthUserSnapshot | null) {
  if (!left || !right) return false;

  return (
    left.id === right.id &&
    (left.displayName ?? '') === (right.displayName ?? '') &&
    (left.role ?? '') === (right.role ?? '') &&
    (left.avatarUrl ?? '') === (right.avatarUrl ?? '')
  );
}

function createInitialState(): AuthState {
  const userSnapshot = readSnapshot();

  return {
    authForm: {
      displayName: '',
      email: 'customer01@gametopup.com',
      password: 'Password123!',
    },
    authInitialized: false,
    authLoading: false,
    authMode: 'login',
    authStatus: 'unknown',
    isAuthenticated: false,
    user: null,
    userSnapshot,
  };
}

let state = createInitialState();
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) listener();
}

function shallowEqualState(left: AuthState, right: AuthState) {
  const keys = Object.keys(left) as Array<keyof AuthState>;

  for (const key of keys) {
    if (!Object.is(left[key], right[key])) return false;
  }

  return true;
}

function setState(partial: Partial<AuthState> | ((current: AuthState) => AuthState)) {
  const nextState = typeof partial === 'function' ? partial(state) : { ...state, ...partial };

  if (shallowEqualState(state, nextState)) return;

  state = nextState;
  emitChange();
}

function beginAuthCheck() {
  setState({
    authInitialized: false,
    authLoading: true,
    authStatus: 'checking',
  });
}

function setGuest() {
  writeSnapshot(null);
  setState({
    authInitialized: true,
    authLoading: false,
    authStatus: 'guest',
    isAuthenticated: false,
    user: null,
    userSnapshot: null,
  });
}

function syncServerUser(user: User | null) {
  if (!user) {
    setGuest();
    return;
  }

  const nextSnapshot = snapshotFromUser(user);

  if (isSameAuthUser(state.user, user)) {
    if (!isSameAuthUser(state.userSnapshot, nextSnapshot)) {
      writeSnapshot(nextSnapshot);
      setState((current) => ({
        ...current,
        authInitialized: true,
        authLoading: false,
        authStatus: 'authenticated',
        isAuthenticated: true,
        userSnapshot: nextSnapshot,
      }));
      return;
    }

    setState((current) => ({
      ...current,
      authInitialized: true,
      authLoading: false,
      authStatus: 'authenticated',
      isAuthenticated: true,
    }));
    return;
  }

  writeSnapshot(nextSnapshot);
  setState({
    authInitialized: true,
    authLoading: false,
    authStatus: 'authenticated',
    isAuthenticated: true,
    user,
    userSnapshot: nextSnapshot,
  });
}

function setUser(user: User | null) {
  if (!user) {
    setGuest();
    return;
  }

  syncServerUser(user);
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

function setAuthStatus(authStatus: AuthStatus) {
  setState({
    authLoading: authStatus === 'checking',
    authStatus,
  });
}

function resetAuthState() {
  setGuest();
}

function updateProfile(displayName: string) {
  const nextUser = state.user
    ? { ...state.user, displayName }
    : null;

  if (!nextUser) return;

  const nextSnapshot = snapshotFromUser(nextUser);
  writeSnapshot(nextSnapshot);
  setState((current) => ({
    ...current,
    user: nextUser,
    userSnapshot: nextSnapshot,
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
  beginAuthCheck,
  getState,
  resetAuthState,
  setAuthForm,
  setAuthLoading,
  setAuthMode,
  setAuthStatus,
  setGuest,
  setUser,
  syncServerUser,
  updateProfile,
};
