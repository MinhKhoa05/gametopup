import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { PublicGame } from './contracts';

export async function getGames() {
  const response = await api.get<ApiResponse<PublicGame[]>>('/api/games');
  return response.data.data;
}
