import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { Game } from './types';

export async function getGames() {
  const response = await api.get<ApiResponse<Game[]>>('/api/games');
  return response.data.data;
}
