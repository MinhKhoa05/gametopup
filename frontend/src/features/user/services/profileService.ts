import { api, ApiResponse } from '../../../lib/api';

export async function updateMyProfile(userId: number, displayName: string) {
  await api.put<ApiResponse<void>>(`/api/users/${userId}`, {
    displayName,
  });
}
