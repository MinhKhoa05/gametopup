import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ADMIN_ORDERS_STALE_TIME, useAdminMutation } from './shared';
import { adminOrdersQueryKey } from './keys';
import { cancelOrder, completeOrder, getAdminOrders, pickOrder } from './api';

export function useAdminOrdersQuery() {
  return useQuery({
    queryKey: adminOrdersQueryKey,
    queryFn: getAdminOrders,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_ORDERS_STALE_TIME,
  });
}

export function useAdminOrderMutations() {
  const pick = useAdminMutation({
    mutationFn: pickOrder,
    successMessage: 'Đã tiếp nhận đơn hàng.',
    queryKeys: [adminOrdersQueryKey],
  });
  const complete = useAdminMutation({
    mutationFn: completeOrder,
    successMessage: 'Đã hoàn thành đơn hàng.',
    queryKeys: [adminOrdersQueryKey],
  });
  const cancel = useAdminMutation({
    mutationFn: cancelOrder,
    successMessage: 'Đã hủy đơn hàng.',
    queryKeys: [adminOrdersQueryKey],
  });

  return { pick, complete, cancel };
}
