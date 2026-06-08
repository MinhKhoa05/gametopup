import { useRoute } from '@/hooks/common/route.hooks';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { AuthFormData } from '@/features/auth/auth.types';
import { useAuthMutations, useAuthUserQuery } from '@/features/auth/api/auth';

export type AuthMode = 'login' | 'register';

export function useAuthSession() {
  const { navigate } = useRoute();
  const authUserQuery = useAuthUserQuery();
  const authMutations = useAuthMutations();
  const user = authUserQuery.data ?? null;
  const authStatus: 'unknown' | 'checking' | 'authenticated' | 'guest' = authUserQuery.isLoading ? 'checking' : user ? 'authenticated' : 'guest';
  const isLoggedIn = authStatus === 'authenticated';
  function submitAuth({ form, mode }: { form: AuthFormData; mode: AuthMode }) {
    const navigateToGames = () => navigate({ name: 'games' });
    const loginPayload = {
      email: form.email,
      password: form.password,
    };

    if (mode === 'register') {
      authMutations.register.mutate(
        {
          displayName: form.displayName,
          email: form.email,
          password: form.password,
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
    isAuthSubmitting: authMutations.login.isPending || authMutations.logout.isPending || authMutations.register.isPending,
    authStatus,
    isLoggedIn,
    handleLogout,
    submitAuth,
    user,
  };
}
