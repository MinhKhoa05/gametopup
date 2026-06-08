export type User = {
  id: number;
  avatarUrl?: string;
  displayName?: string;
  email: string;
  role?: number | string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
