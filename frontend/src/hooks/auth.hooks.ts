import { FormEvent, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { Route } from '../lib/routes';
import { getMe, login, logout, register } from '../services/auth.api';
import { authActions, useAuthStore } from '../store/auth.store';
import type { AuthFormState, AuthMode, AuthStatus, AuthUserSnapshot } from '../types/auth.types';
import type { User } from '../types';

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

function sameAuthUser(left: User | AuthUserSnapshot | null, right: User | AuthUserSnapshot | null) {
  if (!left || !right) return false;

  return (
    left.id === right.id &&
    (left.displayName ?? '') === (right.displayName ?? '') &&
    (left.role ?? '') === (right.role ?? '') &&
    (left.avatarUrl ?? '') === (right.avatarUrl ?? '')
  );
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

export function useAuthSession({
  navigate,
  execute,
}: {
  navigate: (route: Route) => void;
  execute: AsyncActionExecutor;
}) {
  const { authMode, authForm, user, authStatus, userSnapshot } = useAuthStore(
    useShallow((state) => ({
      authMode: state.authMode,
      authForm: state.authForm,
      user: state.user,
      authStatus: state.authStatus,
      userSnapshot: state.userSnapshot,
    })),
  );
  const cachedSnapshot = readSnapshot();
  const effectiveUserSnapshot = userSnapshot ?? cachedSnapshot;

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      if (cachedSnapshot && !useAuthStore.getState().userSnapshot) {
        authActions.setUserSnapshot(cachedSnapshot);
      }

      authActions.setAuthLoading(true);
      authActions.setAuthStatus('checking');

      try {
        const serverUser = await getMe();
        if (!isMounted) return;

        const current = useAuthStore.getState();
        const nextSnapshot = snapshotFromUser(serverUser);

        if (sameAuthUser(current.user, serverUser)) {
          if (!sameAuthUser(current.userSnapshot, nextSnapshot)) {
            authActions.setUserSnapshot(nextSnapshot);
            writeSnapshot(nextSnapshot);
          }
        } else {
          authActions.setUser(serverUser);
          authActions.setUserSnapshot(nextSnapshot);
          writeSnapshot(nextSnapshot);
        }

        authActions.setAuthStatus('authenticated');
      } catch {
        if (!isMounted) return;
        writeSnapshot(null);
        authActions.setGuest();
      } finally {
        if (!isMounted) return;
        authActions.setAuthLoading(false);
      }
    }

    bootstrapAuth().catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAuth(event: FormEvent) {
    event.preventDefault();
    const current = useAuthStore.getState();

    await execute(
      async () => {
        if (current.authMode === 'register') {
          await register(current.authForm.displayName, current.authForm.email, current.authForm.password);
        }

        return login(current.authForm.email, current.authForm.password);
      },
      {
        successMessage: current.authMode === 'register' ? 'Đăng ký và đăng nhập thành công.' : 'Đăng nhập thành công.',
        onSuccess: (loggedInUser) => {
          authActions.setUser(loggedInUser);
          authActions.setUserSnapshot(snapshotFromUser(loggedInUser));
          writeSnapshot(snapshotFromUser(loggedInUser));
          authActions.setAuthStatus('authenticated');
          authActions.setAuthLoading(false);
          navigate({ name: 'games' });
        },
      },
    );
  }

  async function handleLogout() {
    await execute(
      async () => {
        await logout();
      },
      {
        successMessage: 'Đã đăng xuất.',
        onSuccess: () => {
          writeSnapshot(null);
          authActions.setGuest();
          navigate({ name: 'home' });
        },
      },
    );
  }

  function handleProfileUpdated(displayName: string) {
    const current = useAuthStore.getState();
    if (!current.user) return;

    authActions.setUser({
      ...current.user,
      displayName,
    });
    const nextSnapshot = snapshotFromUser({
      ...current.user,
      displayName,
    });
    writeSnapshot(nextSnapshot);
    authActions.setUserSnapshot(nextSnapshot);
    authActions.setAuthStatus('authenticated');
    authActions.setAuthLoading(false);
  }

  return {
    authForm,
    authMode,
    authStatus,
    handleAuth,
    handleLogout,
    handleProfileUpdated,
    setAuthForm: authActions.setAuthForm,
    setAuthMode: authActions.setAuthMode,
    user,
    userSnapshot: effectiveUserSnapshot,
  };
}
