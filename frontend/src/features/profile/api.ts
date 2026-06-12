import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';

export type UpdateMyProfileInput = {
  userId: number;
  displayName: string;
};

export async function updateMyProfile({ displayName, userId }: UpdateMyProfileInput) {
  await api.put<ApiResponse<void>>(`/api/users/${userId}`, {
    displayName,
  });
}
