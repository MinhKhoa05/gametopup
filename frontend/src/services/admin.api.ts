import { api, ApiResponse } from '../lib/api';
import { Game, GamePackage, Order, User } from '../types';

export type GamePayload = Pick<Game, 'name' | 'imageUrl' | 'isActive'>;

export type GamePackagePayload = Pick<
  GamePackage,
  'name' | 'imageUrl' | 'gameId' | 'salePrice' | 'originalPrice' | 'importPrice' | 'stockQuantity' | 'isActive'
>;

export async function createGame(payload: GamePayload) {
  const response = await api.post<ApiResponse<Game>>('/api/games', payload);
  return response.data.data;
}

export async function updateGame(id: number, payload: GamePayload) {
  const response = await api.put<ApiResponse<Game>>(`/api/games/${id}`, payload);
  return response.data.data;
}

export async function deleteGame(id: number) {
  await api.delete<ApiResponse<void>>(`/api/games/${id}`);
}

export async function createGamePackage(payload: GamePackagePayload) {
  const response = await api.post<ApiResponse<GamePackage>>('/api/game-packages', payload);
  return response.data.data;
}

export async function updateGamePackage(id: number, payload: Omit<GamePackagePayload, 'gameId'>) {
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
  const response = await api.post<ApiResponse<unknown>>(`/api/orders/${orderId}/pick`);
  return response.data.data;
}

export async function completeOrder(orderId: number) {
  const response = await api.post<ApiResponse<unknown>>(`/api/orders/${orderId}/complete`);
  return response.data.data;
}

export async function cancelOrder(orderId: number) {
  const response = await api.post<ApiResponse<unknown>>(`/api/orders/${orderId}/cancel`);
  return response.data.data;
}

export async function getAdminUsers(page = 1, pageSize = 200) {
  const response = await api.get<ApiResponse<User[]>>('/api/users', {
    params: { page, pageSize },
  });

  return response.data.data;
}

export async function updateUser(id: number, payload: Partial<Pick<User, 'displayName' | 'email' | 'role' | 'isActive'>>) {
  await api.put<ApiResponse<void>>(`/api/users/${id}`, payload);
}

export async function deleteUser(id: number) {
  await api.delete<ApiResponse<void>>(`/api/users/${id}`);
}
