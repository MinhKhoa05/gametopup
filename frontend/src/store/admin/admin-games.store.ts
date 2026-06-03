import { create } from 'zustand';
import type { Game } from '../../types';

type AdminGamesStore = {
  games: Game[];
  loading: boolean;
  setGames: (games: Game[]) => void;
  setLoading: (loading: boolean) => void;
};

export const useAdminGamesStore = create<AdminGamesStore>((set) => ({
  games: [],
  loading: false,
  setGames: (games) => set({ games }),
  setLoading: (loading) => set({ loading }),
}));
