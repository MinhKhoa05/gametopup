import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { AuthFormData, ChangePasswordRequest } from '@/features/auth/types';
import type { User } from '@/features/users/types'

export type LoginRequest = Pick<AuthFormData, 'email' | 'password'>;

export async function getMe() {
  const response = await api.get<ApiResponse<User>>('/api/users/me');
  return response.data.data;
}

export async function login(payload: LoginRequest) {
  await api.post<ApiResponse<void>>('/api/auth/login', payload);
}

export async function register(payload: AuthFormData) {
  await api.post<ApiResponse<void>>('/api/auth/register', payload);
}

export async function changePassword(payload: ChangePasswordRequest) {
  await api.put<ApiResponse<void>>('/api/auth/password', payload);
}

export async function logout() {
  await api.post<ApiResponse<void>>('/api/auth/logout');
}
