import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';

export type UpdateMyProfileInput = {
  displayName: string;
};

export async function updateMyProfile({ displayName }: UpdateMyProfileInput) {
  await api.put<ApiResponse<void>>('/api/users/me', {
    displayName,
  });
}
