import { api, ApiResponse } from '../../../lib/api';
import { Game, GamePackage, Order } from '../../../types';

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
  await api.delete<ApiResponse<null>>(`/api/games/${id}`);
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
  await api.delete<ApiResponse<null>>(`/api/game-packages/${id}`);
}

export async function getAdminOrders() {
  const response = await api.get<ApiResponse<Order[]>>('/api/orders');
  return response.data.data;
}
