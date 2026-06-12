import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { GamePackage } from '@/features/games/types';

export const adminPackagesKeys = {
  all: ['admin', 'packages'] as const,
};

export type AdminPackageInput = {
  id?: number;
  gameId: number;
  name: string;
  imageFile: File | null;
  salePrice: number;
  originalPrice: number;
  importPrice: number;
  stockQuantity: number;
  isActive: boolean;
};

export type AdminPackageUpdateInput = Omit<AdminPackageInput, 'gameId'> & {
  id: number;
};

type AdminPackageWriteInput = {
  gameId?: number;
  name: string;
  imageFile: File | null;
  salePrice: number;
  originalPrice: number;
  importPrice: number;
  stockQuantity: number;
  isActive: boolean;
};

function appendFormValue(formData: FormData, key: string, value: string | number | boolean | File | null | undefined) {
  if (value === undefined || value === null) {
    return;
  }

  formData.append(key, value instanceof File ? value : String(value));
}

function buildPackageFormData(payload: AdminPackageWriteInput) {
  const formData = new FormData();
  appendFormValue(formData, 'gameId', payload.gameId);
  appendFormValue(formData, 'name', payload.name);
  appendFormValue(formData, 'salePrice', payload.salePrice);
  appendFormValue(formData, 'originalPrice', payload.originalPrice);
  appendFormValue(formData, 'importPrice', payload.importPrice);
  appendFormValue(formData, 'stockQuantity', payload.stockQuantity);
  appendFormValue(formData, 'isActive', payload.isActive);
  appendFormValue(formData, 'image', payload.imageFile);
  return formData;
}

export async function getAdminPackages() {
  const response = await api.get<ApiResponse<GamePackage[]>>('/api/game-packages');
  return response.data.data;
}

export async function createAdminPackage(payload: Omit<AdminPackageInput, 'id'>) {
  const response = await api.post<ApiResponse<GamePackage>>('/api/game-packages/with-image', buildPackageFormData(payload));
  return response.data.data;
}

export async function updateAdminPackage({ id, ...payload }: AdminPackageUpdateInput) {
  const response = await api.put<ApiResponse<GamePackage>>(`/api/game-packages/${id}/with-image`, buildPackageFormData(payload));
  return response.data.data;
}

export async function deleteAdminPackage({ id }: Required<Pick<AdminPackageInput, 'id'>>) {
  await api.delete<ApiResponse<void>>(`/api/game-packages/${id}`);
}
