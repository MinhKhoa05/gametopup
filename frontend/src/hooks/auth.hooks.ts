import { FormEvent, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { Route } from '../lib/routes';
import { getMe, login, logout, register } from '../services/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { User } from '../types';
import type { AuthUserSnapshot } from '../types/auth.types';

function snapshotFromUser(user: User | null): AuthUserSnapshot | null {
  if (!user) return null;
  return { id: user.id, displayName: user.displayName ?? user.email, avatarUrl: user.avatarUrl, role: user.role };
}

export function useAuthSession({ navigate, execute }: { navigate: (route: Route) => void; execute: AsyncActionExecutor; }) {
  const { authMode, authForm, user, authStatus, userSnapshot } = useAuthStore(
    useShallow((state) => ({
      authMode: state.authMode,
      authForm: state.authForm,
      user: state.user,
      authStatus: state.authStatus,
      userSnapshot: state.userSnapshot,
    })),
  );

  useEffect(() => {
    let isMounted = true;
    async function bootstrapAuth() {
      const current = useAuthStore.getState();
      current.setAuthLoading(true);
      current.setAuthStatus('checking');

      try {
        const serverUser = await getMe();
        if (!isMounted) return;

        const latestCurrent = useAuthStore.getState();
        latestCurrent.setUser(serverUser);
        latestCurrent.setUserSnapshot(snapshotFromUser(serverUser));
        latestCurrent.setAuthStatus('authenticated');
      } catch {
        if (!isMounted) return;
        useAuthStore.getState().setGuest();
      } finally {
        if (!isMounted) return;
        useAuthStore.getState().setAuthLoading(false);
      }
    }

    bootstrapAuth().catch(() => undefined);
    return () => { isMounted = false; };
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
          const store = useAuthStore.getState();
          store.setUser(loggedInUser);
          store.setUserSnapshot(snapshotFromUser(loggedInUser));
          store.setAuthStatus('authenticated');
          store.setAuthLoading(false);
          navigate({ name: 'games' });
        },
      }
    );
  }

  async function handleLogout() {
    await execute(async () => { await logout(); }, {
      successMessage: 'Đã đăng xuất.',
      onSuccess: () => {
        useAuthStore.getState().setGuest();
        navigate({ name: 'home' });
      },
    });
  }

  function handleProfileUpdated(displayName: string) {
    const current = useAuthStore.getState();
    if (!current.user) return;
    current.setUser({ ...current.user, displayName });
    current.setUserSnapshot(snapshotFromUser({ ...current.user, displayName }));
    current.setAuthStatus('authenticated');
    current.setAuthLoading(false);
  }

  return {
    authForm,
    authMode,
    authStatus,
    handleAuth,
    handleLogout,
    handleProfileUpdated,
    setAuthForm: (f: any) => useAuthStore.getState().setAuthForm(f),
    setAuthMode: (m: any) => useAuthStore.getState().setAuthMode(m),
    user,
    userSnapshot,
  };
}
