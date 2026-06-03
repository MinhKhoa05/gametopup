import { create } from 'zustand';
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

const initialState: Omit<GamesStore, 'setGames' | 'setGamesLoading' | 'setPackagesForGame' | 'setPackagesLoadingForGame' | 'clearPackagesForGame'> = {
  games: [],
  gamesLoading: false,
  packagesByGame: {},
  packagesLoadingByGame: {},
};

export const useGamesStore = create<GamesStore>((set) => ({
  ...initialState,
  setGames: (games) =>
    set({
      games,
      gamesLoading: false,
    }),
  setGamesLoading: (gamesLoading) => set({ gamesLoading }),
  setPackagesForGame: (gameId, packages) =>
    set((current) => ({
      packagesByGame: {
        ...current.packagesByGame,
        [gameId]: packages,
      },
      packagesLoadingByGame: {
        ...current.packagesLoadingByGame,
        [gameId]: false,
      },
    })),
  setPackagesLoadingForGame: (gameId, loading) =>
    set((current) => ({
      packagesLoadingByGame: {
        ...current.packagesLoadingByGame,
        [gameId]: loading,
      },
    })),
  clearPackagesForGame: (gameId) =>
    set((current) => {
      const nextPackagesByGame = { ...current.packagesByGame };
      const nextLoadingByGame = { ...current.packagesLoadingByGame };

      delete nextPackagesByGame[gameId];
      delete nextLoadingByGame[gameId];

      return {
        packagesByGame: nextPackagesByGame,
        packagesLoadingByGame: nextLoadingByGame,
      };
    }),
}));

export const gamesActions = {
  clearPackagesForGame: (gameId: number) => useGamesStore.getState().clearPackagesForGame(gameId),
  setGames: (games: Game[]) => useGamesStore.getState().setGames(games),
  setGamesLoading: (gamesLoading: boolean) => useGamesStore.getState().setGamesLoading(gamesLoading),
  setPackagesForGame: (gameId: number, packages: GamePackage[]) =>
    useGamesStore.getState().setPackagesForGame(gameId, packages),
  setPackagesLoadingForGame: (gameId: number, loading: boolean) =>
    useGamesStore.getState().setPackagesLoadingForGame(gameId, loading),
};
