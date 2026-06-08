import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ADMIN_DATA_STALE_TIME, useAdminMutation } from './shared';
import { adminUsersQueryKey } from './keys';
import { deleteUser, getAdminUsers, updateUser } from './api';

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: adminUsersQueryKey,
    queryFn: () => getAdminUsers(),
    placeholderData: keepPreviousData,
    staleTime: ADMIN_DATA_STALE_TIME,
  });
}

export function useAdminUserMutations() {
  const update = useAdminMutation({
    mutationFn: updateUser,
    successMessage: 'Đã cập nhật người dùng.',
    queryKeys: [adminUsersQueryKey],
  });
  const remove = useAdminMutation({
    mutationFn: deleteUser,
    successMessage: 'Đã xóa người dùng.',
    queryKeys: [adminUsersQueryKey],
  });

  return { update, remove };
}
