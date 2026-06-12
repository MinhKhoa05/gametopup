import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { GamePackage } from '@/features/games/types';

export async function getGamePackagesByGame(gameId: number) {
  const response = await api.get<ApiResponse<GamePackage[]>>(`/api/game-packages/game/${gameId}`);
  return response.data.data;
}
