import { useEffect, useRef } from 'react';
import type { AuthStatus, AuthUserSnapshot } from '../../types/auth.types';
import type { User } from '../../types';

type StableLoginViewArgs = {
  authStatus: AuthStatus;
  user: User | null;
  userSnapshot: AuthUserSnapshot | null;
};

export function useStableLoginView({ authStatus, user, userSnapshot }: StableLoginViewArgs) {
  const liveHasLogin = Boolean(user || userSnapshot);
  const lastKnownHasLoginRef = useRef<boolean | null>(liveHasLogin ? true : null);

  useEffect(() => {
    if (authStatus === 'unknown' || authStatus === 'checking') {
      return;
    }

    lastKnownHasLoginRef.current = liveHasLogin;
  }, [authStatus, liveHasLogin]);

  const isAuthPending = authStatus === 'unknown' || authStatus === 'checking';
  const hasKnownSession = lastKnownHasLoginRef.current !== null;
  const hasLogin = isAuthPending ? (lastKnownHasLoginRef.current ?? liveHasLogin) : liveHasLogin;

  return {
    hasKnownSession,
    hasLogin,
    isAuthPending,
  };
}
