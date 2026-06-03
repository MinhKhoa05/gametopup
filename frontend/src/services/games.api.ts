import { api, ApiResponse } from '../lib/api';
import { Game, GamePackage } from '../types';

export async function getGames() {
  const response = await api.get<ApiResponse<Game[]>>('/api/games');
  return response.data.data;
}

export async function getPackagesByGame(gameId: number) {
  const response = await api.get<ApiResponse<GamePackage[]>>(`/api/game-packages/game/${gameId}`);
  return response.data.data;
}

export async function getAllPackages() {
  const response = await api.get<ApiResponse<GamePackage[]>>('/api/game-packages');
  return response.data.data;
}
