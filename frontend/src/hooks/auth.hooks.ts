import { FormEvent } from 'react';
import { Route } from '../lib/routes';
import { useAuthStore } from '../store/auth.store';
import type { AuthStatus } from '../types';
import { useAuthMutations, useAuthUserQuery } from '../services/auth';

export function useAuthSession({
  navigate,
}: {
  navigate: (route: Route) => void;
}) {
  const authUserQuery = useAuthUserQuery();
  const authMutations = useAuthMutations();
  const user = authUserQuery.data ?? null;
  const authStatus: AuthStatus = authUserQuery.isLoading ? 'checking' : user ? 'authenticated' : 'guest';
  const authMode = useAuthStore((state) => state.authMode);
  const authForm = useAuthStore((state) => state.authForm);

  function handleAuth(event: FormEvent) {
    event.preventDefault();
    const current = useAuthStore.getState();

    const loginPayload = {
      email: current.authForm.email,
      password: current.authForm.password,
    };

    const navigateToGames = () => navigate({ name: 'games' });

    if (current.authMode === 'register') {
      authMutations.register.mutate(
        {
          displayName: current.authForm.displayName,
          email: current.authForm.email,
          password: current.authForm.password,
        },
        {
          onSuccess: () => {
            authMutations.login.mutate(loginPayload, {
              onSuccess: navigateToGames,
            });
          },
        },
      );
      return;
    }

    authMutations.login.mutate(loginPayload, {
      onSuccess: navigateToGames,
    });
  }

  function handleLogout() {
    authMutations.logout.mutate(undefined, {
      onSuccess: () => {
        useAuthStore.getState().setGuest();
        navigate({ name: 'home' });
      },
    });
  }

  return {
    authBusy: authMutations.login.isPending || authMutations.logout.isPending || authMutations.register.isPending,
    authForm,
    authMode,
    authStatus,
    handleAuth,
    handleLogout,
    setAuthForm: (f: any) => useAuthStore.getState().setAuthForm(f),
    setAuthMode: (m: any) => useAuthStore.getState().setAuthMode(m),
    user,
  };
}
