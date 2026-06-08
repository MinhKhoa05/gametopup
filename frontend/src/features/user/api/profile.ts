import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';
import { AUTH_USER_QUERY_KEY } from '@/features/auth/api/auth';
import { api, type ApiResponse } from '@/lib/api';
import type { User } from '@/features/user/user.types';

export type UpdateMyProfilePayload = {
  id: number;
  displayName: string;
};

// ==========================================
// 1. API SERVICES
// ==========================================
export async function updateMyProfile({ id, displayName }: UpdateMyProfilePayload) {
  await api.put<ApiResponse<void>>(`/api/users/${id}`, { displayName });
}

// ==========================================
// 2. REACT QUERY HOOKS
// ==========================================
export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: function handleUpdateProfileSuccess(_, variables) {
      function updateCurrentUser(current: User | null | undefined) {
        if (!current) {
          return current;
        }

        return { ...current, displayName: variables.displayName };
      }

      queryClient.setQueryData<User | null>(AUTH_USER_QUERY_KEY, updateCurrentUser);
      queryClient.invalidateQueries({ queryKey: AUTH_USER_QUERY_KEY });
      toast.success('Đã cập nhật hồ sơ.');
    },
  });
}
