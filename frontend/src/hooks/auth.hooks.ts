import { FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { Route } from '../lib/routes';
import { AUTH_USER_QUERY_KEY, login, logout, register, useAuthUserQuery } from '../services/auth';
import { depositRequestsQueryKey, transactionsQueryKey, walletQueryKey } from '../services/wallet';
import { ordersQueryKey } from '../services/orders';
import { useAuthStore } from '../store/auth.store';
import type { AuthStatus, User } from '../types';

function clearSessionQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.removeQueries({ queryKey: AUTH_USER_QUERY_KEY });
  queryClient.removeQueries({ queryKey: walletQueryKey });
  queryClient.removeQueries({ queryKey: transactionsQueryKey });
  queryClient.removeQueries({ queryKey: depositRequestsQueryKey });
  queryClient.removeQueries({ queryKey: ordersQueryKey });
}

export function useAuthSession({
  navigate,
  execute,
}: {
  navigate: (route: Route) => void;
  execute: AsyncActionExecutor;
}) {
  const queryClient = useQueryClient();
  const authUserQuery = useAuthUserQuery();
  const user = authUserQuery.data ?? null;
  const authStatus: AuthStatus = authUserQuery.isLoading ? 'checking' : user ? 'authenticated' : 'guest';
  const authMode = useAuthStore((state) => state.authMode);
  const authForm = useAuthStore((state) => state.authForm);

  async function syncAuthUser(nextUser: User | null) {
    clearSessionQueries(queryClient);

    if (nextUser) {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, nextUser);
    }
  }

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
        onSuccess: async (loggedInUser) => {
          await syncAuthUser(loggedInUser);
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
        onSuccess: async () => {
          clearSessionQueries(queryClient);
          useAuthStore.getState().setGuest();
          navigate({ name: 'home' });
        },
      },
    );
  }

  function handleProfileUpdated(displayName: string) {
    const currentUser = authUserQuery.data;
    if (!currentUser) return;

    queryClient.setQueryData(AUTH_USER_QUERY_KEY, { ...currentUser, displayName });
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
  };
}
