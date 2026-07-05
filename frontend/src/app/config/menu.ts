import { routes } from "@/app/router/routes";

export type HeaderMenuItem = {
  label: string;
  href?: string;
  action?: "logout";
  dividerAfter?: boolean;
};

export const HEADER_USER_MENU_ITEMS: HeaderMenuItem[] = [
  {
    label: "Hồ sơ",
    href: routes.profile(),
  },
  {
    label: "Lịch sử đơn",
    href: routes.orders(),
  },
  {
    label: "Lịch sử ví",
    href: routes.wallet(),
  },
  {
    label: "Trang chủ",
    href: routes.home(),
    dividerAfter: true,
  },
  {
    label: "Đăng xuất",
    action: "logout",
  },
];

export const HEADER_ADMIN_MENU_ITEMS: HeaderMenuItem[] = [
  {
    label: "Hồ sơ",
    href: routes.profile(),
  },
  {
    label: "Lịch sử đơn",
    href: routes.orders(),
  },
  {
    label: "Lịch sử ví",
    href: routes.wallet(),
    dividerAfter: true,
  },
  {
    label: "Trang quản trị",
    href: routes.admin(),
  },
  {
    label: "Quản lý game",
    href: routes.admin("games"),
  },
  {
    label: "Đơn hàng",
    href: routes.admin("orders"),
  },
  {
    label: "Nạp tiền",
    href: routes.admin("deposits"),
  },
  {
    label: "Người dùng",
    href: routes.admin("users"),
    dividerAfter: true,
  },
  {
    label: "Đăng xuất",
    action: "logout",
  },
];
