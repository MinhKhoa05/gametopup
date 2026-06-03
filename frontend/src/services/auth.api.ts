import { api, ApiResponse } from '../lib/api';
import { User } from '../types';

type AuthPayload = {
  user: RawUser;
};

type RawUser = User;

export async function login(email: string, password: string) {
  const response = await api.post<ApiResponse<AuthPayload>>('/api/auth/login', {
    email,
    password,
  });

  return normalizeUser(response.data.data.user);
}

export async function register(displayName: string, email: string, password: string) {
  await api.post<ApiResponse<void>>('/api/auth/register', {
    displayName,
    email,
    password,
  });
}

export async function logout() {
  await api.post<ApiResponse<void>>('/api/auth/logout');
}

export async function getMe() {
  const response = await api.get<ApiResponse<RawUser>>('/api/users/me');
  return normalizeUser(response.data.data);
}

function normalizeUser(user: RawUser | null): User | null {
  if (!user) return null;

  return {
    id: user.id,
    avatarUrl: user.avatarUrl ?? (user as { avatar?: string }).avatar ?? (user as { photoUrl?: string }).photoUrl,
    displayName: user.displayName ?? user.email,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}
