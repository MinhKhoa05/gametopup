import { routes } from "@/app/router/routes";

export type NavItem = {
  label: string;
  href: string;
};

export type HeaderNavItem = NavItem & {
  requiresAuth?: boolean;
};

export type BottomNavItem = NavItem & {
  iconKey: "home" | "games" | "wallet" | "orders" | "profile";
  requiresAuth?: boolean;
};

export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  {
    label: "Trang chủ",
    href: routes.homeGuest(),
  },
  {
    label: "Kho game",
    href: routes.games(),
  },
  {
    label: "Lịch sử đơn",
    href: routes.orders(),
    requiresAuth: true,
  },
  {
    label: "Nạp ví",
    href: routes.wallet(),
    requiresAuth: true,
  },
];

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  {
    label: "Trang chủ",
    href: routes.homeGuest(),
    iconKey: "home",
  },
  {
    label: "Kho game",
    href: routes.games(),
    iconKey: "games",
  },
  {
    label: "Ví",
    href: routes.wallet(),
    iconKey: "wallet",
    requiresAuth: true,
  },
  {
    label: "Đơn hàng",
    href: routes.orders(),
    iconKey: "orders",
    requiresAuth: true,
  },
  {
    label: "Tài khoản",
    href: routes.profile(),
    iconKey: "profile",
    requiresAuth: true,
  },
];