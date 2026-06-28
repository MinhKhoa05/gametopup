import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { User } from '@/features/users/types';

export async function getAdminUsers() {
  const response = await api.get<ApiResponse<User[]>>('/api/admin/users');
  return response.data.data;
}

export type UpdateProfileInput = {
  displayName: string;
};

export async function updateMyProfile({ displayName }: UpdateProfileInput) {
  await api.put<ApiResponse<void>>('/api/users/me', { displayName });
}