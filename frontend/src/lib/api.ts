import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
};

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
const apiBaseUrl = configuredBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

type AuthRetryConfig = AxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

let refreshRequest: Promise<void> | null = null;

async function refreshSession() {
  refreshRequest ??= api
    .post<ApiResponse<unknown>>('/api/auth/refresh', null, {
      _skipAuthRefresh: true,
    } as AuthRetryConfig)
    .then(() => undefined)
    .finally(() => {
      refreshRequest = null;
    });

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
    } catch (refreshError) {
      return Promise.reject(refreshError);
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
