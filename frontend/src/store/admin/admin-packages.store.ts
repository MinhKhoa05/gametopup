import { create } from 'zustand';
import type { GamePackage } from '../../types';

type AdminPackagesStore = {
  packages: GamePackage[];
  loading: boolean;
  setPackages: (packages: GamePackage[]) => void;
  setLoading: (loading: boolean) => void;
};

export const useAdminPackagesStore = create<AdminPackagesStore>((set) => ({
  packages: [],
  loading: false,
  setPackages: (packages) => set({ packages }),
  setLoading: (loading) => set({ loading }),
}));
