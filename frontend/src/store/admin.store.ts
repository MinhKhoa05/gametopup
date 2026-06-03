import { create } from 'zustand';
import type { Game, GamePackage, Order, User } from '../types';
import type { AdminCatalogMetrics } from '../types/admin.types';

export type { AdminCatalogMetrics } from '../types/admin.types';

type AdminStore = {
  games: Game[];
  packages: GamePackage[];
  orders: Order[];
  users: User[];
  loading: boolean;
  setGames: (games: Game[]) => void;
  setPackages: (packages: GamePackage[]) => void;
  setOrders: (orders: Order[]) => void;
  setUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
  clearAdminCatalog: () => void;
};

export const useAdminStore = create<AdminStore>((set) => ({
  games: [],
  packages: [],
  orders: [],
  users: [],
  loading: false,

  setGames: (games) => set({ games }),
  setPackages: (packages) => set({ packages }),
  setOrders: (orders) => set({ orders }),
  setUsers: (users) => set({ users }),
  setLoading: (loading) => set({ loading }),
  clearAdminCatalog: () =>
    set({
      games: [],
      packages: [],
      orders: [],
      users: [],
      loading: false,
    }),
}));

export const adminActions = {
  clearAdminCatalog: () => useAdminStore.getState().clearAdminCatalog(),
  setGames: (games: Game[]) => useAdminStore.getState().setGames(games),
  setLoading: (loading: boolean) => useAdminStore.getState().setLoading(loading),
  setOrders: (orders: Order[]) => useAdminStore.getState().setOrders(orders),
  setPackages: (packages: GamePackage[]) => useAdminStore.getState().setPackages(packages),
  setUsers: (users: User[]) => useAdminStore.getState().setUsers(users),
};
