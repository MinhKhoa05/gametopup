import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { Game, GameInput, AdminGame } from './types';
import { appendFormValue } from '@/shared/api/formData';

export async function getGames() {
  const response = await api.get<ApiResponse<Game[]>>('/api/games');
  return response.data.data;
}

// ----- ADMIN ----- 

function buildGameFormData(payload: GameInput) {
  const formData = new FormData();
  appendFormValue(formData, 'name', payload.name);
  appendFormValue(formData, 'isActive', payload.isActive);
  appendFormValue(formData, 'imageFile', payload.imageFile);
  return formData;
}

export async function createGame(payload: GameInput) {
  const response = await api.post<ApiResponse<AdminGame>>('/api/admin/games', buildGameFormData(payload));
  return response.data.data;
}

export async function updateGame(id: number, payload: GameInput) {
  const response = await api.put<ApiResponse<AdminGame>>(`/api/admin/games/${id}`, buildGameFormData(payload));
  return response.data.data;
}

export async function deleteGame(id: number) {
  await api.delete<ApiResponse<void>>(`/api/admin/games/${id}`);
}

export async function getAdminGames() {
  const response = await api.get<ApiResponse<AdminGame[]>>('/api/admin/games');
  return response.data.data;
}
