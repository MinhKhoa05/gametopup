import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';

export type AdminGameSummary = {
  id: number;
  name: string;
  imageUrl: string;
  isActive: boolean;
  packageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminGameInput = {
  id?: number;
  name: string;
  imageFile: File | null;
  isActive: boolean;
};

function appendFormValue(formData: FormData, key: string, value: string | number | boolean | File | null | undefined) {
  if (value === undefined || value === null) {
    return;
  }

  formData.append(key, value instanceof File ? value : String(value));
}

function buildGameFormData(payload: Omit<AdminGameInput, 'id'>) {
  const formData = new FormData();
  appendFormValue(formData, 'name', payload.name);
  appendFormValue(formData, 'isActive', payload.isActive);
  appendFormValue(formData, 'imageFile', payload.imageFile);
  return formData;
}

export async function createAdminGame(payload: Omit<AdminGameInput, 'id'>) {
  const response = await api.post<ApiResponse<AdminGameSummary>>('/api/admin/games', buildGameFormData(payload));
  return response.data.data;
}

export async function updateAdminGame({ id, ...payload }: Required<Pick<AdminGameInput, 'id'>> & Omit<AdminGameInput, 'id'>) {
  const response = await api.put<ApiResponse<AdminGameSummary>>(`/api/admin/games/${id}`, buildGameFormData(payload));
  return response.data.data;
}

export async function deleteAdminGame({ id }: Required<Pick<AdminGameInput, 'id'>>) {
  await api.delete<ApiResponse<void>>(`/api/admin/games/${id}`);
}

export async function getAdminGames() {
  const response = await api.get<ApiResponse<AdminGameSummary[]>>('/api/admin/games');
  return response.data.data;
}
