import { UserRole } from "@/features/users/types";
import { IconBox, Badge } from "@/shared/components";
import { ShieldCheck, UserRound, CheckCircle2, X } from "lucide-react";

const ROLE_META = {
  [UserRole.Member]: {
    label: "Member",
    tone: "neutral",
  },
  [UserRole.Admin]: {
    label: "Admin",
    tone: "primary",
  },
  [UserRole.Staff]: {
    label: "Staff",
    tone: "neutral",
  },
} as const;

const STATUS_META = {
  true: {
    label: "Hoạt động",
    tone: "success",
    icon: <CheckCircle2 size={14} />,
  },
  false: {
    label: "Đã khóa",
    tone: "neutral",
    icon: <X size={14} />,
  },
} as const;

export function RoleBadge({ role = UserRole.Member }: { role?: UserRole }) {
  const meta = ROLE_META[role];

  return (
    <Badge tone={meta.tone} icon={<ShieldCheck size={14} />}>
      {meta.label}
    </Badge>
  );
}

export function StatusBadge({ active = true }: { active?: boolean }) {
  const meta = STATUS_META[String(active) as "true" | "false"];

  return (
    <Badge tone={meta.tone} icon={meta.icon}>
      {meta.label}
    </Badge>
  );
}

export function UserIcon({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <IconBox size={size} tone="neutral" className="rounded-[16px]">
      {" "}
      <UserRound size={size === "lg" ? 24 : 18} />{" "}
    </IconBox>
  );
}