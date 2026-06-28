export type AuthFormData = {
  displayName: string;
  email: string;
  password: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
}
