import { useEffect } from 'react';
import { toast } from 'sonner';
import { getApiMessage } from '@/shared/api/errors';
import { useLogoutMutation, useLoginMutation, useRegisterMutation, useAuthUserQuery } from '../server';
import type { AuthFormData } from '../types';

export type AuthMode = 'login' | 'register';

export function useAuthSession() {
  const userQuery = useAuthUserQuery();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  const user = userQuery.data ?? null;
  const status = userQuery.isLoading ? 'checking' : user ? 'authenticated' : 'guest';
  const displayName = user?.displayName || user?.email || 'Khách';

  useEffect(() => {
    if (userQuery.error) {
      toast.error(getApiMessage(userQuery.error));
    }
  }, [userQuery.error]);

  function handleLogout() {
    logoutMutation.mutate();
  }

  async function submitAuth(mode: AuthMode, form: AuthFormData) {
    const loginPayload = {
      email: form.email.trim(),
      password: form.password,
    };

    if (mode === 'register') {
      await registerMutation.mutateAsync({
        displayName: form.displayName.trim(),
        ...loginPayload,
      });
    }

    return loginMutation.mutateAsync(loginPayload);
  }

  return {
    isSubmitting: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    status,
    submitAuth,
    user,
    userDisplayName: displayName,
    handleLogout,
  };
}
