import { create } from 'zustand';

/**
 * State xác thực dùng chung cho toàn bộ ứng dụng.
 */
type AuthStore = {
  sessionExpiredAt: number | null;

  markSessionExpired: () => void;
  setGuest: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  sessionExpiredAt: null,

  markSessionExpired: () => set({ sessionExpiredAt: Date.now() }),

  setGuest: () => {
    set({
      sessionExpiredAt: null,
    });
  },
}));
