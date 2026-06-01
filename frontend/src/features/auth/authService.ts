import { api, ApiResponse } from '../../lib/api';
import { User } from '../../types';

type AuthPayload = {
  user: RawUser | null;
};

type RawUser = User & {
};

export async function login(email: string, password: string) {
  const response = await api.post<ApiResponse<AuthPayload>>('/api/auth/login', {
    email,
    password,
  });

  return normalizeUser(response.data.data.user);
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
  const response = await api.get<ApiResponse<RawUser>>('/api/users/me');
  return normalizeUser(response.data.data);
}

function normalizeUser(user: RawUser | null): User | null {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}
