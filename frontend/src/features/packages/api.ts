import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { GamePackage } from '@/features/games/contracts';

export async function getGamePackagesByGame(gameId: number) {
  const response = await api.get<ApiResponse<GamePackage[]>>(`/api/games/${gameId}/packages`);
  return response.data.data;
}
