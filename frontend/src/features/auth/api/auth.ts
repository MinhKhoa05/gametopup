import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, type ApiResponse } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useGameOrderStore } from '@/features/topup/store/topup.store';
import type { User } from '@/features/user/user.types';

export const AUTH_USER_QUERY_KEY = ['auth-user'] as const;

type AuthResponse = {
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  displayName: string;
  email: string;
  password: string;
};

// ==========================================
// 1. API SERVICES
// ==========================================
export async function getMe() {
  const response = await api.get<ApiResponse<User>>('/api/users/me');
  return response.data.data;
}

export async function login(payload: LoginPayload) {
  const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', payload);
  return response.data.data.user;
}

export async function register(payload: RegisterPayload) {
  await api.post<ApiResponse<void>>('/api/auth/register', payload);
}

export async function logout() {
  await api.post<ApiResponse<void>>('/api/auth/logout');
}

// ==========================================
// 2. REACT QUERY HOOKS
// ==========================================
export function useAuthUserQuery() {
  return useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: getMe,
    placeholderData: keepPreviousData,
    meta: { persist: true },
    retry: false,
    staleTime: Infinity,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: function handleLoginSuccess(user) {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user);
      toast.success('Đăng nhập thành công.');
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register,
    onSuccess: function handleRegisterSuccess() {
      toast.success('Đăng ký thành công.');
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: async function handleLogoutSuccess() {
      queryClient.clear();
      queryClient.setQueryData<User | null>(AUTH_USER_QUERY_KEY, null);
      useAuthStore.getState().setGuest();
      useGameOrderStore.getState().resetWizard();
      toast.success('Đăng xuất thành công.');
    },
  });
}

export function useAuthMutations() {
  return {
    login: useLoginMutation(),
    logout: useLogoutMutation(),
    register: useRegisterMutation(),
  };
}
