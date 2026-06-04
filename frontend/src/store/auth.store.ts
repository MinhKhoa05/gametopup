import { create } from 'zustand';
import type { AuthFormData, AuthMode } from '../types';

const defaultAuthForm: AuthFormData = {
  displayName: '',
  email: 'customer01@gametopup.com',
  password: 'Password123!',
};

/**
 * State xác thực dùng chung cho toàn bộ ứng dụng.
 */
type AuthStore = {
  authForm: AuthFormData;
  authMode: AuthMode;
  sessionExpiredAt: number | null;

  setAuthForm: (authForm: AuthFormData) => void;
  setAuthMode: (authMode: AuthMode) => void;
  markSessionExpired: () => void;
  setGuest: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  authForm: defaultAuthForm,
  authMode: 'login',
  sessionExpiredAt: null,

  setAuthForm: (authForm) => set({ authForm }),
  setAuthMode: (authMode) => set({ authMode }),
  markSessionExpired: () => set({ sessionExpiredAt: Date.now() }),

  setGuest: () => {
    set({
      authMode: 'login',
      authForm: defaultAuthForm,
      sessionExpiredAt: null,
    });
  },
}));
