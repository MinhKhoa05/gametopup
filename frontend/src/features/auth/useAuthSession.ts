import { FormEvent, useEffect, useState } from 'react';
import { getMe, login, logout, register } from './authService';
import { Route } from '../../lib/routes';
import { User } from '../../types';
import { AsyncActionExecutor } from '../../hooks/useAsyncAction';

type AuthMode = 'login' | 'register';

export function useAuthSession({
  navigate,
  execute,
}: {
  navigate: (route: Route) => void;
  execute: AsyncActionExecutor;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: 'customer01@gametopup.com',
    password: 'Password123!',
  });
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      setAuthLoading(true);

      try {
        const currentUser = await getMe();
        if (mounted) setUser(currentUser);
      } catch {
        // Guest sessions are valid; failing to load /me should not block browsing.
      } finally {
        if (mounted) setAuthLoading(false);
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
        if (authMode === 'register') await register(authForm.name, authForm.email, authForm.password);
        return login(authForm.email, authForm.password);
      },
      {
        successMessage: authMode === 'register' ? 'Đăng ký và đăng nhập thành công.' : 'Đăng nhập thành công.',
        onSuccess: (loggedInUser) => {
          setUser(loggedInUser);
          navigate({ name: 'games' });
        },
      },
    );
  }

  async function handleLogout() {
    await execute(logout, {
      successMessage: 'Đã đăng xuất.',
      onSuccess: () => {
        setUser(null);
        navigate({ name: 'home' });
      },
    });
  }

  return {
    authForm,
    authLoading,
    authMode,
    handleAuth,
    handleLogout,
    setAuthForm,
    setAuthMode,
    user,
  };
}
