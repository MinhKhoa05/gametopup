import { api, type ApiResponse } from '@/lib/api';
import type { AdminDepositRequest } from '@/features/admin/admin.types';
import type { AdminGamePackage, Game, GamePackage } from '@/features/games/games.types';
import type { Order } from '@/features/orders/orders.types';
import type { User } from '@/features/user/user.types';

export type GamePayload = {
  imageFile: File | null;
  isActive: boolean;
  name: string;
};

export type GamePackagePayload = {
  gameId: number;
  imageFile: File | null;
  importPrice: number;
  isActive: boolean;
  name: string;
  originalPrice: number;
  salePrice: number;
  stockQuantity: number;
};

export type UpdateGamePackagePayload = Omit<GamePackagePayload, 'gameId'>;
export type UpdateUserPayload = {
  displayName: string;
  email: string;
  role: number;
  isActive: boolean;
};

function appendFormValue(formData: FormData, key: string, value: string | number | boolean | File | null | undefined) {
  if (value === undefined || value === null) {
    return;
  }

  formData.append(key, value instanceof File ? value : String(value));
}

function buildGameFormData(payload: GamePayload) {
  const formData = new FormData();
  appendFormValue(formData, 'name', payload.name);
  appendFormValue(formData, 'isActive', payload.isActive);
  appendFormValue(formData, 'image', payload.imageFile);
  return formData;
}

function buildGamePackageFormData(payload: GamePackagePayload | UpdateGamePackagePayload) {
  const formData = new FormData();
  appendFormValue(formData, 'gameId', 'gameId' in payload ? payload.gameId : undefined);
  appendFormValue(formData, 'name', payload.name);
  appendFormValue(formData, 'salePrice', payload.salePrice);
  appendFormValue(formData, 'originalPrice', payload.originalPrice);
  appendFormValue(formData, 'importPrice', payload.importPrice);
  appendFormValue(formData, 'stockQuantity', payload.stockQuantity);
  appendFormValue(formData, 'isActive', payload.isActive);
  appendFormValue(formData, 'image', payload.imageFile);
  return formData;
}

export async function createGame(payload: GamePayload) {
  const response = await api.post<ApiResponse<Game>>('/api/games/with-image', buildGameFormData(payload));
  return response.data.data;
}

export async function updateGame({ id, payload }: { id: number; payload: GamePayload }) {
  const response = await api.put<ApiResponse<Game>>(`/api/games/${id}/with-image`, buildGameFormData(payload));
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
  const response = await api.post<ApiResponse<GamePackage>>('/api/game-packages/with-image', buildGamePackageFormData(payload));
  return response.data.data;
}

export async function updateGamePackage({ id, payload }: { id: number; payload: UpdateGamePackagePayload }) {
  const response = await api.put<ApiResponse<GamePackage>>(`/api/game-packages/${id}/with-image`, buildGamePackageFormData(payload));
  return response.data.data;
}

export async function deleteGamePackage(payload: { id: number }) {
  await api.delete<ApiResponse<void>>(`/api/game-packages/${payload.id}`);
}

export async function getAdminOrders() {
  const response = await api.get<ApiResponse<Order[]>>('/api/orders');
  return response.data.data;
}

export async function getAdminDepositRequests() {
  const response = await api.get<ApiResponse<AdminDepositRequest[]>>('/api/wallet/deposit-requests');
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

export async function approveDepositRequest(payload: { note?: string; requestId: number }) {
  const body = payload.note?.trim() ? { note: payload.note.trim() } : {};
  const response = await api.post<ApiResponse<AdminDepositRequest>>(`/api/wallet/deposit-requests/${payload.requestId}/approve`, body);
  return response.data.data;
}

export async function rejectDepositRequest(payload: { note?: string; requestId: number }) {
  const body = payload.note?.trim() ? { note: payload.note.trim() } : {};
  const response = await api.post<ApiResponse<AdminDepositRequest>>(`/api/wallet/deposit-requests/${payload.requestId}/reject`, body);
  return response.data.data;
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

