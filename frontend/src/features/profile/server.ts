import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AUTH_USER_QUERY_KEY } from '@/features/auth/server';
import type { User } from '@/features/auth/types';
import { updateMyProfile } from './api';
import type { UpdateMyProfileInput } from './api';

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMyProfileInput) => updateMyProfile(payload),
    onSuccess(_, variables) {
      queryClient.setQueryData<User | null>(AUTH_USER_QUERY_KEY, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          displayName: variables.displayName,
        };
      });
      toast.success('Đã cập nhật hồ sơ.');
    },
  });
}
