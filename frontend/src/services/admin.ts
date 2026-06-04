import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, type ApiResponse } from '../lib/api';
import { GAMES_QUERY_KEY } from './games';
import type { AdminGamePackage, Game, GamePackage, Order, User } from '../types';

export type GamePayload = Pick<Game, 'name' | 'imageUrl' | 'isActive'>;
export type GamePackagePayload = Omit<AdminGamePackage, 'id'>;
export type UpdateGamePackagePayload = Omit<GamePackagePayload, 'gameId'>;
export type UpdateUserPayload = {
  displayName: string;
  email: string;
  role: number;
  isActive: boolean;
};

export const adminPackagesQueryKey = ['admin-packages'] as const;
export const adminOrdersQueryKey = ['admin-orders'] as const;
export const adminUsersQueryKey = ['admin-users'] as const;

// ==========================================
// 1. API SERVICES
// ==========================================
export async function createGame(payload: GamePayload) {
  const response = await api.post<ApiResponse<Game>>('/api/games', payload);
  return response.data.data;
}

export async function updateGame({ id, payload }: { id: number; payload: GamePayload }) {
  const response = await api.put<ApiResponse<Game>>(`/api/games/${id}`, payload);
  return response.data.data;
}

export async function deleteGame(payload: { id: number }) {
  await api.delete<ApiResponse<void>>(`/api/games/${payload.id}`);
}

export async function getAllPackages() {
  const response = await api.get<ApiResponse<AdminGamePackage[]>>('/api/game-packages');
  return response.data.data;
}

export async function createGamePackage(payload: GamePackagePayload) {
  const response = await api.post<ApiResponse<GamePackage>>('/api/game-packages', payload);
  return response.data.data;
}

export async function updateGamePackage({ id, payload }: { id: number; payload: UpdateGamePackagePayload }) {
  const response = await api.put<ApiResponse<GamePackage>>(`/api/game-packages/${id}`, payload);
  return response.data.data;
}

export async function deleteGamePackage(payload: { id: number }) {
  await api.delete<ApiResponse<void>>(`/api/game-packages/${payload.id}`);
}

export async function getAdminOrders() {
  const response = await api.get<ApiResponse<Order[]>>('/api/orders');
  return response.data.data;
}

export async function pickOrder(payload: { orderId: number }) {
  await api.post<ApiResponse<void>>(`/api/orders/${payload.orderId}/pick`);
}

export async function completeOrder(payload: { orderId: number }) {
  await api.post<ApiResponse<void>>(`/api/orders/${payload.orderId}/complete`);
}

export async function cancelOrder(payload: { orderId: number }) {
  await api.post<ApiResponse<void>>(`/api/orders/${payload.orderId}/cancel`);
}

export async function getAdminUsers(page = 1, pageSize = 200) {
  const response = await api.get<ApiResponse<User[]>>('/api/users', { params: { page, pageSize } });
  return response.data.data;
}

export async function deleteUser(payload: { id: number }) {
  await api.delete<ApiResponse<void>>(`/api/users/${payload.id}`);
}

export async function updateUser({ id, payload }: { id: number; payload: UpdateUserPayload }) {
  const response = await api.put<ApiResponse<User>>(`/api/users/${id}`, payload);
  return response.data.data;
}

// ==========================================
// 2. REACT QUERY HOOKS
// ==========================================
const ADMIN_DATA_STALE_TIME = 1000 * 60 * 5;
const ADMIN_ORDERS_STALE_TIME = 1000 * 30;

function refreshAdminData(queryClient: ReturnType<typeof useQueryClient>, queryKeys: ReadonlyArray<readonly unknown[]>) {
  for (const queryKey of queryKeys) {
    queryClient.invalidateQueries({ queryKey: [...queryKey] });
  }
}

function useAdminMutation<TVariables, TData = unknown>({
  mutationFn,
  successMessage,
  queryKeys,
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage: string;
  queryKeys: ReadonlyArray<readonly unknown[]>;
}) {
  const queryClient = useQueryClient();

  return useMutation<TData, unknown, TVariables>({
    mutationFn,
    onSuccess: function handleAdminMutationSuccess() {
      refreshAdminData(queryClient, queryKeys);
      toast.success(successMessage);
    },
  });
}

export function useAdminPackagesQuery() {
  return useQuery({
    queryKey: adminPackagesQueryKey,
    queryFn: getAllPackages,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_DATA_STALE_TIME,
  });
}

export function useAdminOrdersQuery() {
  return useQuery({
    queryKey: adminOrdersQueryKey,
    queryFn: getAdminOrders,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_ORDERS_STALE_TIME,
  });
}

export function useAdminUsersQuery() {
  function getUsers() {
    return getAdminUsers();
  }

  return useQuery({
    queryKey: adminUsersQueryKey,
    queryFn: getUsers,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_DATA_STALE_TIME,
  });
}

export function useAdminGameMutations() {
  const create = useAdminMutation({
    mutationFn: createGame,
    successMessage: 'Đã tạo game mới.',
    queryKeys: [GAMES_QUERY_KEY],
  });
  const update = useAdminMutation({
    mutationFn: updateGame,
    successMessage: 'Đã cập nhật game.',
    queryKeys: [GAMES_QUERY_KEY],
  });
  const remove = useAdminMutation({
    mutationFn: deleteGame,
    successMessage: 'Đã xóa game.',
    queryKeys: [GAMES_QUERY_KEY],
  });

  return { create, update, remove };
}

export function useAdminPackageMutations() {
  const create = useAdminMutation({
    mutationFn: createGamePackage,
    successMessage: 'Đã tạo gói nạp mới.',
    queryKeys: [adminPackagesQueryKey],
  });
  const update = useAdminMutation({
    mutationFn: updateGamePackage,
    successMessage: 'Đã cập nhật gói nạp.',
    queryKeys: [adminPackagesQueryKey],
  });
  const remove = useAdminMutation({
    mutationFn: deleteGamePackage,
    successMessage: 'Đã xóa gói nạp.',
    queryKeys: [adminPackagesQueryKey],
  });

  return { create, update, remove };
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
