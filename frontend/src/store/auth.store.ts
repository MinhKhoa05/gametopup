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

  setAuthForm: (authForm: AuthFormData) => void;
  setAuthMode: (authMode: AuthMode) => void;
  setGuest: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  authForm: defaultAuthForm,
  authMode: 'login',

  setAuthForm: (authForm) => set({ authForm }),
  setAuthMode: (authMode) => set({ authMode }),

  setGuest: () => {
    set({
      authMode: 'login',
      authForm: defaultAuthForm,
    });
  },
}));
