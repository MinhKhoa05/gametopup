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
