import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiResponse, getApiMessage } from '../lib/api';
import { toast } from 'sonner';
import { GAMES_QUERY_KEY } from './games';
import { AdminGamePackage, Game, GamePackage, Order, User } from '../types';

// ==========================================
// 1. API SERVICES (pure server calls)
// ==========================================
export type GamePayload = Pick<Game, 'name' | 'imageUrl' | 'isActive'>;
export type GamePackagePayload = Omit<AdminGamePackage, 'id'>;
export type UpdateGamePackagePayload = Omit<GamePackagePayload, 'gameId'>;
export type UpdateUserPayload = { displayName: string; email: string; role: number; isActive: boolean };

export async function createGame(payload: GamePayload) {
  const response = await api.post<ApiResponse<Game>>('/api/games', payload);
  return response.data.data;
}

export async function updateGame({ id, payload }: { id: number; payload: GamePayload }) {
  const response = await api.put<ApiResponse<Game>>(`/api/games/${id}`, payload);
  return response.data.data;
}

export async function deleteGame(id: number) {
  await api.delete<ApiResponse<void>>(`/api/games/${id}`);
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

export async function deleteGamePackage(id: number) {
  await api.delete<ApiResponse<void>>(`/api/game-packages/${id}`);
}

export async function getAdminOrders() {
  const response = await api.get<ApiResponse<Order[]>>('/api/orders');
  return response.data.data;
}

export async function pickOrder(orderId: number) {
  await api.post<ApiResponse<void>>(`/api/orders/${orderId}/pick`);
}

export async function completeOrder(orderId: number) {
  await api.post<ApiResponse<void>>(`/api/orders/${orderId}/complete`);
}

export async function cancelOrder(orderId: number) {
  await api.post<ApiResponse<void>>(`/api/orders/${orderId}/cancel`);
}

export async function getAdminUsers(page = 1, pageSize = 200) {
  const response = await api.get<ApiResponse<User[]>>('/api/users', {
    params: { page, pageSize },
  });

  return response.data.data;
}

export async function deleteUser(id: number) {
  await api.delete<ApiResponse<void>>(`/api/users/${id}`);
}

export async function updateUser({ id, payload }: { id: number; payload: UpdateUserPayload }) {
  const response = await api.put<ApiResponse<User>>(`/api/users/${id}`, payload);
  return response.data.data;
}

// ==========================================
// 2. REACT QUERY HOOKS (cache / SWR / background revalidate)
// ==========================================
export const adminPackagesQueryKey = ['admin-packages'] as const;
export const adminOrdersQueryKey = ['admin-orders'] as const;
export const adminUsersQueryKey = ['admin-users'] as const;

const ADMIN_DATA_STALE_TIME = 1000 * 60 * 5;
const ADMIN_ORDERS_STALE_TIME = 1000 * 30;

function notifySuccess(message: string) {
  toast.success(message);
}

function notifyError(error: unknown) {
  toast.error(getApiMessage(error));
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
  return useQuery({
    queryKey: adminUsersQueryKey,
    queryFn: () => getAdminUsers(),
    placeholderData: keepPreviousData,
    staleTime: ADMIN_DATA_STALE_TIME,
  });
}

// ==========================================
// 3. REACT QUERY MUTATIONS (write + auto refresh)
// ==========================================
export function useAdminGameMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEY });
      notifySuccess('Đã tạo game mới.');
    },
    onError: notifyError,
  });

  const update = useMutation({
    mutationFn: updateGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEY });
      notifySuccess('Đã cập nhật game.');
    },
    onError: notifyError,
  });

  const remove = useMutation({
    mutationFn: deleteGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEY });
      notifySuccess('Đã xóa game.');
    },
    onError: notifyError,
  });

  return { create, update, remove };
}

export function useAdminPackageMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createGamePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPackagesQueryKey });
      notifySuccess('Đã tạo gói nạp mới.');
    },
    onError: notifyError,
  });

  const update = useMutation({
    mutationFn: updateGamePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPackagesQueryKey });
      notifySuccess('Đã cập nhật gói nạp.');
    },
    onError: notifyError,
  });

  const remove = useMutation({
    mutationFn: deleteGamePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPackagesQueryKey });
      notifySuccess('Đã xóa gói nạp.');
    },
    onError: notifyError,
  });

  return { create, update, remove };
}

export function useAdminOrderMutations() {
  const queryClient = useQueryClient();

  const pick = useMutation({
    mutationFn: pickOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey });
      notifySuccess('Đã tiếp nhận đơn hàng.');
    },
    onError: notifyError,
  });

  const complete = useMutation({
    mutationFn: completeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey });
      notifySuccess('Đã hoàn thành đơn hàng.');
    },
    onError: notifyError,
  });

  const cancel = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey });
      notifySuccess('Đã hủy đơn hàng.');
    },
    onError: notifyError,
  });

  return { pick, complete, cancel };
}

export function useAdminUserMutations() {
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
      notifySuccess('Đã cập nhật người dùng.');
    },
    onError: notifyError,
  });

  const remove = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
      notifySuccess('Đã xóa người dùng.');
    },
    onError: notifyError,
  });

  return { update, remove };
}
