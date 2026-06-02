import { FormEvent, useEffect } from 'react';
import { getMe, login, logout, register } from '../services/authService';
import { Route } from '../../../lib/routes';
import { AsyncActionExecutor } from '../../../hooks/useAsyncAction';
import { authStore, useAuthStore } from '../../../store/auth.store';

export function useAuthSession({
  navigate,
  execute,
}: {
  navigate: (route: Route) => void;
  execute: AsyncActionExecutor;
}) {
  const authMode = useAuthStore((state) => state.authMode);
  const authForm = useAuthStore((state) => state.authForm);

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      authStore.setAuthLoading(true);

      try {
        const currentUser = await getMe();
        if (mounted) authStore.setUser(currentUser);
      } catch {
        // Guest sessions are valid; failing to load /me should not block browsing.
      } finally {
        if (mounted) authStore.setAuthLoading(false);
      }
    }

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleAuth(event: FormEvent) {
    event.preventDefault();

    await execute(
      async () => {
        if (authMode === 'register') await register(authForm.displayName, authForm.email, authForm.password);
        return login(authForm.email, authForm.password);
      },
      {
        successMessage: authMode === 'register' ? 'Đăng ký và đăng nhập thành công.' : 'Đăng nhập thành công.',
        onSuccess: (loggedInUser) => {
          authStore.setUser(loggedInUser);
          navigate({ name: 'games' });
        },
      },
    );
  }

  async function handleLogout() {
    await execute(logout, {
      successMessage: 'Đã đăng xuất.',
      onSuccess: () => {
        authStore.resetAuthState();
        navigate({ name: 'home' });
      },
    });
  }

  function handleProfileUpdated(displayName: string) {
    authStore.updateProfile(displayName);
  }

  return {
    handleAuth,
    handleLogout,
    handleProfileUpdated,
    setAuthForm: authStore.setAuthForm,
    setAuthMode: authStore.setAuthMode,
  };
}
