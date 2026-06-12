import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { User } from '@/features/auth/types';

export const adminUsersKeys = {
  all: ['admin', 'users'] as const,
};

export type AdminUserUpdateInput = {
  id: number;
  displayName: string;
  email: string;
  role: number;
  isActive: boolean;
};

export type AdminUserDeleteInput = {
  id: number;
};

export async function getAdminUsers() {
  const response = await api.get<ApiResponse<User[]>>('/api/users', {
    params: {
      page: 1,
      pageSize: 200,
    },
  });

  return response.data.data;
}

export async function updateAdminUser({ id, ...payload }: AdminUserUpdateInput) {
  await api.put<ApiResponse<void>>(`/api/users/${id}`, payload);
}

export async function deleteAdminUser({ id }: AdminUserDeleteInput) {
  await api.delete<ApiResponse<void>>(`/api/users/${id}`);
}
