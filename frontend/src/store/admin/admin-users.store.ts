import { create } from 'zustand';
import type { User } from '../../types';

type AdminUsersStore = {
  users: User[];
  loading: boolean;
  setUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
};

export const useAdminUsersStore = create<AdminUsersStore>((set) => ({
  users: [],
  loading: false,
  setUsers: (users) => set({ users }),
  setLoading: (loading) => set({ loading }),
}));
