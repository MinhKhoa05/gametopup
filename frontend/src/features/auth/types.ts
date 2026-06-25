export type User = {
  id: number;
  avatarUrl?: string;
  displayName?: string;
  email: string;
  role?: UserRole;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export enum UserRole {
  Member = 0,
  Admin = 1,
  Staff = 2,
}

export type AuthFormData = {
  displayName: string;
  email: string;
  password: string;
};
