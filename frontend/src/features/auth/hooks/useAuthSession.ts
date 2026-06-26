import { useEffect } from "react";
import { toast } from "sonner";

import { getApiMessage } from "@/shared/api/errors";
import {
  useAuthUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from "../server";
import type { AuthFormData, UserRole } from "../types";

export type AuthMode = "login" | "register";

export function useAuthSession() {
  const userQuery = useAuthUserQuery();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  const user = userQuery.data ?? null;

  const isAuthenticated = user !== null;
  const isChecking = userQuery.isLoading;

  const userDisplayName = user?.displayName ?? "Khách";

  useEffect(() => {
    if (!userQuery.error) {
      return;
    }

    toast.error(getApiMessage(userQuery.error));
  }, [userQuery.error]);

  async function submitAuth(
    mode: AuthMode,
    form: AuthFormData,
  ) {
    const payload = {
      email: form.email.trim(),
      password: form.password,
    };

    if (mode === "register") {
      await registerMutation.mutateAsync({
        displayName: form.displayName.trim(),
        ...payload,
      });
    }

    return loginMutation.mutateAsync(payload);
  }

  return {
    user,
    userRole: user?.role as UserRole | undefined,
    userDisplayName,

    isAuthenticated,
    isChecking,

    isSubmitting:
      loginMutation.isPending ||
      registerMutation.isPending ||
      logoutMutation.isPending,

    submitAuth,

    logout: () => logoutMutation.mutate(),
  };
}