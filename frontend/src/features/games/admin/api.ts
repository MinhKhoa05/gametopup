export type { AdminGame } from '../types';
export type AdminGameSummary = import('../types').AdminGame;

export {
  createGame,
  deleteGame,
  getAdminGames,
  getGames,
  updateGame,
} from '../api';
