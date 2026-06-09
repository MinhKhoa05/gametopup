import type { ApiResponse } from '@/shared/types/api.types';
export type { ApiResponse };
import axios, { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/store/auth.store';

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

type AuthRetryConfig = AxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

let refreshRequest: Promise<void> | null = null;

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
    }
    return config;
  }

  if (config.headers && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

async function refreshSession() {
  if (refreshRequest) {
    return refreshRequest;
  }

  refreshRequest = (async () => {
    try {
      await api.post<ApiResponse<unknown>>('/api/auth/refresh', null, {
        _skipAuthRefresh: true,
      } as AuthRetryConfig);
    } finally {
      refreshRequest = null;
    }
  })();

  return refreshRequest;
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as AuthRetryConfig | undefined;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest._skipAuthRefresh ||
      originalRequest.url?.includes('/api/auth/refresh') ||
      originalRequest.url?.includes('/api/auth/login')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshSession();
      return api(originalRequest);
    } catch {
      useAuthStore.getState().markSessionExpired();
      return Promise.reject(error);
    }
  },
);

export function getApiMessage(error: unknown) {
  const fallback = 'Không thể kết nối đến hệ thống. Vui lòng thử lại sau.';

  if (!axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return fallback;
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.errorCode ||
    error.message ||
    fallback
  );
}
