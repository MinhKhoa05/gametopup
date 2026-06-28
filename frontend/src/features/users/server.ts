import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AUTH_USER_QUERY_KEY } from "@/features/auth/server";
import type { User } from "@/features/auth/types";
import { getAdminUsers, updateMyProfile } from "./api";

export const adminUsersKeys = {
  all: ["admin", "users"] as const,
};

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess(_, variables) {
      queryClient.setQueryData<User | null>(AUTH_USER_QUERY_KEY, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          displayName: variables.displayName,
        };
      });
      toast.success("Đã cập nhật hồ sơ.");
    },
  });
}

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: adminUsersKeys.all,
    queryFn: getAdminUsers,
  });
}
