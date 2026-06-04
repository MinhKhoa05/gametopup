import { useMutation } from '@tanstack/react-query';
import { api, ApiResponse } from '../lib/api';

// ==========================================
// 1. API SERVICES (pure server calls)
// ==========================================
export async function updateMyProfile(userId: number, displayName: string) {
  await api.put<ApiResponse<void>>(`/api/users/${userId}`, {
    displayName,
  });
}

// ==========================================
// 2. REACT QUERY MUTATIONS (cache / invalidation)
// ==========================================
export function useUpdateMyProfileMutation(userId: number | null) {
  return useMutation({
    mutationFn: async (displayName: string) => {
      if (!userId) {
        throw new Error('Không tìm thấy người dùng để cập nhật.');
      }

      await updateMyProfile(userId, displayName);
      return displayName;
    },
  });
}
