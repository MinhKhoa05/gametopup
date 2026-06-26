import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getMe, login, logout, register, changePassword } from "./api";
import type { User, ChangePasswordRequest } from "./types";

export const AUTH_USER_QUERY_KEY = ["auth", "me"] as const;
const PRIVATE_QUERY_PREFIXES = new Set(["auth", "wallet", "orders", "admin"]);
const REMEMBERED_EMAIL_KEY = "gametopup:last-auth-email";

export function clearAuthSessionCache(queryClient: QueryClient) {
  queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);

  queryClient.removeQueries({
    predicate: (query) =>
      isPrivateQueryKey(query.queryKey) &&
      query.queryKey !== AUTH_USER_QUERY_KEY,
  });
}

export async function bootstrapAuthSession(queryClient: QueryClient) {
  try {
    const user = await getMe();
    queryClient.setQueryData(AUTH_USER_QUERY_KEY, user);
    return user;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      clearAuthSessionCache(queryClient);
    }

    return null;
  }
}

export function rememberAuthEmail(email: string) {
  if (typeof window === "undefined") {
    return;
  }

  const value = email.trim();
  if (value) {
    window.localStorage.setItem(REMEMBERED_EMAIL_KEY, value);
  }
}

export function getRememberedAuthEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "";
}

function isPrivateQueryKey(queryKey: readonly unknown[]) {
  const [firstSegment] = queryKey;

  return (
    typeof firstSegment === "string" && PRIVATE_QUERY_PREFIXES.has(firstSegment)
  );
}

export function useAuthUserQuery() {
  return useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: false,
    meta: { persist: true },
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess(user, variables) {
      rememberAuthEmail(variables.email);
      queryClient.setQueryData<User>(AUTH_USER_QUERY_KEY, user);
      toast.success("Đăng nhập thành công.");
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register,
    onSuccess() {
      toast.success("Đăng ký thành công.");
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess() {
      toast.success("Đổi mật khẩu thành công");
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess() {
      const currentUser = queryClient.getQueryData<User | null>(
        AUTH_USER_QUERY_KEY,
      );
      if (currentUser?.email) {
        rememberAuthEmail(currentUser.email);
      }

      clearAuthSessionCache(queryClient);

      toast.success("Đăng xuất thành công.");
    },
  });
}
