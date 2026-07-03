import type { DashboardStats } from './types';
import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';

export async function getDashboardStats() {
  const response = await api.get<ApiResponse<DashboardStats>>('/api/admin/dashboard/stats');
  return response.data.data;
}
