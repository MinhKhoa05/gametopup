import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AUTH_USER_QUERY_KEY, clearAuthSessionCache } from '@/features/auth/server';
import type { User } from '@/features/auth/types';
import { adminUsersKeys, deleteAdminUser, getAdminUsers, updateAdminUser } from '../api';
import type { AdminUserDeleteInput, AdminUserUpdateInput } from '../api';

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: adminUsersKeys.all,
    queryFn: getAdminUsers,
  });
}

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminUserUpdateInput) => updateAdminUser(payload),
    onSuccess(_, variables) {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
      queryClient.setQueryData<User | null>(AUTH_USER_QUERY_KEY, (current) => {
        if (!current || current.id !== variables.id) {
          return current;
        }

        return {
          ...current,
          displayName: variables.displayName,
          email: variables.email,
          role: variables.role,
          isActive: variables.isActive,
        };
      });
      toast.success('Đã cập nhật người dùng.');
    },
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminUserDeleteInput) => deleteAdminUser(payload),
    onSuccess(_, variables) {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
      const currentUser = queryClient.getQueryData<User | null>(AUTH_USER_QUERY_KEY);
      if (currentUser?.id === variables.id) {
        clearAuthSessionCache(queryClient);
      }
      toast.success('Đã xóa người dùng.');
    },
  });
}

export function useAdminUsersSection() {
  const usersQuery = useAdminUsersQuery();
  const userMutations = {
    update: useUpdateAdminUserMutation(),
    remove: useDeleteAdminUserMutation(),
  };

  const users = usersQuery.data ?? [];
  const loading = usersQuery.isPending && !usersQuery.data;
  const busy = [userMutations.update.isPending, userMutations.remove.isPending].some(Boolean);

  return {
    busy,
    loading,
    removeUser: async (id: number) => {
      await userMutations.remove.mutateAsync({ id });
    },
    updateUser: async (payload: { id: number; displayName: string; email: string; role: number; isActive: boolean }) => {
      await userMutations.update.mutateAsync(payload);
    },
    users,
  };
}
