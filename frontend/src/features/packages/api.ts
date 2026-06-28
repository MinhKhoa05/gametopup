import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { GamePackage, AdminGamePackage, GamePackageInput } from './types';
import { appendFormValue } from '@/shared/api/formData';

export async function getGamePackagesByGame(gameId: number) {
  const response = await api.get<ApiResponse<GamePackage[]>>(`/api/games/${gameId}/packages`);
  return response.data.data;
}

// ----- ADMIN -----

function buildPackageFormData(payload: GamePackageInput) {
  const formData = new FormData();
  appendFormValue(formData, 'name', payload.name);
  appendFormValue(formData, 'salePrice', payload.salePrice);
  appendFormValue(formData, 'originalPrice', payload.originalPrice);
  appendFormValue(formData, 'importPrice', payload.importPrice);
  appendFormValue(formData, 'availableSlots', payload.availableSlots);
  appendFormValue(formData, 'isActive', payload.isActive);
  appendFormValue(formData, 'imageFile', payload.imageFile);
  return formData;
}

export async function getAdminPackages(gameId?: number | null) {
  const response = await api.get<ApiResponse<AdminGamePackage[]>>(`/api/admin/games/${gameId}/packages`);
  return response.data.data;
}

export async function createPackage(gameId: number, payload: GamePackageInput) {
  const response = await api.post<ApiResponse<AdminGamePackage>>(`/api/admin/games/${gameId}/packages`, buildPackageFormData(payload));
  return response.data.data;
}

export async function updatePackage(id: number, payload: GamePackageInput) {
  const response = await api.put<ApiResponse<AdminGamePackage>>(`/api/admin/packages/${id}`, buildPackageFormData(payload));
  return response.data.data;
}

export async function deletePackage(id: number) {
  await api.delete<ApiResponse<void>>(`/api/admin/packages/${id}`);
}
