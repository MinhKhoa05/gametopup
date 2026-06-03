import { create } from 'zustand';
import { userDisplayName } from '../lib/labels';
import type { User } from '../types';
import type { UserProfileState } from '../types/user.types';

type UserProfileStore = UserProfileState & {
  reset: (user: User | null) => void;
  setDraftName: (draftName: string) => void;
  setSaveError: (saveError: string | null) => void;
};

export const useUserProfileStore = create<UserProfileStore>((set) => ({
  draftName: '',
  saveError: null,

  reset: (user) =>
    set({
      draftName: userDisplayName(user),
      saveError: null,
    }),

  setDraftName: (draftName) => set({ draftName }),

  setSaveError: (saveError) => set({ saveError }),
}));

export const userActions = {
  reset: (user: User | null) => useUserProfileStore.getState().reset(user),
  setDraftName: (draftName: string) => useUserProfileStore.getState().setDraftName(draftName),
  setSaveError: (saveError: string | null) => useUserProfileStore.getState().setSaveError(saveError),
};
