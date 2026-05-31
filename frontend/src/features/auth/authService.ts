import { api, ApiResponse } from '../../lib/api';
import { User } from '../../types';

type AuthPayload = {
  user: User | null;
};

export async function login(email: string, password: string) {
  const response = await api.post<ApiResponse<AuthPayload>>('/api/auth/login', {
    email,
    password,
  });

  return response.data.data.user;
}

export async function register(name: string, email: string, password: string) {
  await api.post<ApiResponse<null>>('/api/auth/register', {
    name,
    email,
    password,
  });
}

export async function logout() {
  await api.post<ApiResponse<null>>('/api/auth/logout');
}

export async function getMe() {
  const response = await api.get<ApiResponse<User>>('/api/users/me');
  return response.data.data;
}
