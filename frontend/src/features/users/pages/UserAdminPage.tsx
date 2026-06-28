import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import type { User } from "@/features/auth/types";
import { useAdminUsersQuery } from "@/features/users/server";
import {
  EmptyState,
  IconBox,
  LoadingState,
  MediaListItem,
  PageHero,
  PanelShell,
  SearchBar,
} from "@/shared/components";
import { formatDate } from "@/shared/lib/format";
import { UserDetailDialog } from "@/features/users/components/UserDetailDialog";
import {
  UserIcon,
  RoleBadge,
  StatusBadge,
} from "@/features/users/components/UserDisplay";

export function UserAdminPage() {
  const usersQuery = useAdminUsersQuery();
  const users = usersQuery.data ?? [];
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return users;

    return users.filter((user) =>
      [user.displayName, user.email]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, users]);

  const loading = usersQuery.isPending && usersQuery.data === undefined;

  return (
    <>
      <div className="grid gap-5">
        <PageHero
          visual={
            <IconBox size="lg" tone="primary" className="h-[56px] w-[56px] rounded-[18px]">
              <Users size={28} strokeWidth={1.8} />
            </IconBox>
          }
          title="Thành viên"
          description="Quản lý danh sách thành viên."
        />

        <PanelShell>
          <div className="grid gap-4 px-5 py-5 sm:px-6 sm:py-6">
            <SearchBar
              ariaLabel="Tìm kiếm"
              dense
              onChange={setQuery}
              placeholder="Tìm theo tên hoặc email..."
              value={query}
            />

            {loading ? (
              <LoadingState title="Đang tải..." />
            ) : filteredUsers.length === 0 ? (
              <EmptyState title="Không tìm thấy thành viên." />
            ) : (
              <div className="grid gap-2.5">
                {filteredUsers.map((user) => (
                  <MediaListItem
                    key={user.id}
                    leading={<UserIcon />}
                    meta={formatDate(user.createdAt)}
                    onClick={() => setSelectedUser(user)}
                    subtitle={user.email}
                    title={user.displayName}
                    titleAccessory={<StatusBadge active={user.isActive} />}
                    trailing={<RoleBadge role={user.role} />}
                  />
                ))}
              </div>
            )}
          </div>
        </PanelShell>
      </div>

      <UserDetailDialog
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </>
  );
}
