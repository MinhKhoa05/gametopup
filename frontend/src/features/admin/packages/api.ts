import { api } from '@/shared/api/client';
import { appendFormValue } from '@/shared/api/formData';
import type { ApiResponse } from '@/shared/types/api';
import type { AdminGamePackage } from '@/features/admin/games/types';

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
  availableSlots: number;
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
  availableSlots: number;
  isActive: boolean;
};

function buildPackageFormData(payload: AdminPackageWriteInput) {
  const formData = new FormData();
  appendFormValue(formData, 'gameId', payload.gameId);
  appendFormValue(formData, 'name', payload.name);
  appendFormValue(formData, 'salePrice', payload.salePrice);
  appendFormValue(formData, 'originalPrice', payload.originalPrice);
  appendFormValue(formData, 'importPrice', payload.importPrice);
  appendFormValue(formData, 'availableSlots', payload.availableSlots);
  appendFormValue(formData, 'isActive', payload.isActive);
  appendFormValue(formData, 'imageFile', payload.imageFile);
  return formData;
}

export async function getAdminPackages() {
  const response = await api.get<ApiResponse<AdminGamePackage[]>>('/api/admin/packages');
  return response.data.data;
}

export async function createAdminPackage(payload: Omit<AdminPackageInput, 'id'>) {
  const response = await api.post<ApiResponse<AdminGamePackage>>(`/api/admin/games/${payload.gameId}/packages`, buildPackageFormData(payload));
  return response.data.data;
}

export async function updateAdminPackage({ id, ...payload }: AdminPackageUpdateInput) {
  const response = await api.put<ApiResponse<AdminGamePackage>>(`/api/admin/packages/${id}`, buildPackageFormData(payload));
  return response.data.data;
}

export async function deleteAdminPackage({ id }: Required<Pick<AdminPackageInput, 'id'>>) {
  await api.delete<ApiResponse<void>>(`/api/admin/packages/${id}`);
}
