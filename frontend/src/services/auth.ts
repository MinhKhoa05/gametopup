import { useQuery } from '@tanstack/react-query';
import { api, type ApiResponse } from '../lib/api';
import type { User } from '../types';

// ==========================================
// API SERVICES (pure server calls)
// ==========================================
export const AUTH_USER_QUERY_KEY = ['auth-user'] as const;

type AuthResponse = {
  user: User;
};

export async function login(email: string, password: string) {
  const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', { email, password });

  return response.data.data.user;
}

export async function register(displayName: string, email: string, password: string) {
  await api.post<ApiResponse<void>>('/api/auth/register', { displayName, email, password });
}

export async function logout() {
  await api.post<ApiResponse<void>>('/api/auth/logout');
}

export async function getMe() {
  const response = await api.get<ApiResponse<User>>('/api/users/me');
  return response.data.data;
}

// ==========================================
// REACT QUERY HOOKS (cache / session sync)
// ==========================================
export function useAuthUserQuery() {
  return useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: getMe,
    retry: false,
    staleTime: Infinity,
  });
}
