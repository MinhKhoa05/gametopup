import axios, { type AxiosRequestConfig } from 'axios';
import { triggerSessionExpired } from '@/app/session';
import type { ApiResponse } from '@/shared/types/api';

export const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

type RetryableConfig = AxiosRequestConfig & {
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
  if (!refreshRequest) {
    refreshRequest = (async () => {
      try {
        await api.post<ApiResponse<unknown>>('/api/auth/refresh', null, {
          _skipAuthRefresh: true,
        } as RetryableConfig);
      } finally {
        refreshRequest = null;
      }
    })();
  }

  return refreshRequest;
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest._skipAuthRefresh ||
      originalRequest.url?.includes('/api/auth/login') ||
      originalRequest.url?.includes('/api/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshSession();
      return api(originalRequest);
    } catch {
      triggerSessionExpired();
      return Promise.reject(error);
    }
  },
);

function normalizeApiBaseUrl(value?: string) {
  const fallback = 'http://localhost:5000';
  const base = (value || fallback).trim();
  return base.replace(/\/api\/?$/, '').replace(/\/$/, '');
}
