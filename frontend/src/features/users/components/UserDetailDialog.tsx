import { UserRound } from "lucide-react";
import type { User } from "@/features/users/types";
import { UserIcon, RoleBadge, StatusBadge } from "./UserDisplay";
import { DetailRow, Dialog, PanelShell } from "@/shared/components";
import { formatDate } from "@/shared/lib/format";

export function UserDetailDialog({
  onClose,
  user,
}: {
  onClose: () => void;
  user: User | null;
}) {
  return (
    <Dialog
      isOpen={Boolean(user)}
      maxWidthClassName="max-w-md"
      onClose={onClose}
      title="Thông tin thành viên"
      icon={<UserRound size={18} />}
    >
      {user ? (
        <div className="grid gap-5">
          <div className="grid gap-4 border-b gt-border pb-5">
            <div className="flex items-center gap-4">
              <UserIcon size="lg" />

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-black gt-text">
                  {user.displayName}
                </h2>
                <p className="truncate text-sm gt-text-muted">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pl-[4.5rem]">
              <RoleBadge role={user.role} />
              <StatusBadge active={user.isActive} />
            </div>
          </div>

          <PanelShell className="p-0">
            <div className="px-4">
              <DetailRow label="Tên" className="py-4">
                {user.displayName}
              </DetailRow>
              <DetailRow label="Email" className="py-4">
                {user.email}
              </DetailRow>
              <DetailRow label="Ngày tham gia" className="py-4">
                {formatDate(user.createdAt)}
              </DetailRow>
            </div>
          </PanelShell>
        </div>
      ) : null}
    </Dialog>
  );
}
