import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Game, GamePackage } from '../types';

type GamesStore = {
  games: Game[];
  gamesLoading: boolean;
  packagesByGame: Record<number, GamePackage[]>;
  packagesLoadingByGame: Record<number, boolean>;
  setGames: (games: Game[]) => void;
  setGamesLoading: (gamesLoading: boolean) => void;
  setPackagesForGame: (gameId: number, packages: GamePackage[]) => void;
  setPackagesLoadingForGame: (gameId: number, loading: boolean) => void;
  clearPackagesForGame: (gameId: number) => void;
};

export const useGamesStore = create<GamesStore>()(
  persist(
    (set) => ({
      games: [],
      gamesLoading: false,
      packagesByGame: {},
      packagesLoadingByGame: {},
      setGames: (games) => set({ games, gamesLoading: false }),
      setGamesLoading: (gamesLoading) => set({ gamesLoading }),
      setPackagesForGame: (gameId, packages) =>
        set((state) => ({
          packagesByGame: { ...state.packagesByGame, [gameId]: packages },
          packagesLoadingByGame: { ...state.packagesLoadingByGame, [gameId]: false },
        })),
      setPackagesLoadingForGame: (gameId, loading) =>
        set((state) => ({
          packagesLoadingByGame: { ...state.packagesLoadingByGame, [gameId]: loading },
        })),
      clearPackagesForGame: (gameId) =>
        set((state) => {
          const packagesByGame = { ...state.packagesByGame };
          const packagesLoadingByGame = { ...state.packagesLoadingByGame };
          delete packagesByGame[gameId];
          delete packagesLoadingByGame[gameId];
          return { packagesByGame, packagesLoadingByGame };
        }),
    }),
    {
      name: 'gametopup-games-cache',
      partialize: (state) => ({ games: state.games, packagesByGame: state.packagesByGame }),
    }
  )
);
