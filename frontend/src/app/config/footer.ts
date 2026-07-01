import { routes } from "@/app/router/routes";

export const DEVELOPER = {
  name: "Hồ Nguyễn Minh Khoa",
  github: "https://github.com/MinhKhoa05",
  linkedin: "https://www.linkedin.com/in/minh-khoa-h%E1%BB%93-nguy%E1%BB%85n-0365353b7/",
} as const;

const CONTACT = {
  email: "mkhoa639@gmail.com",
  facebook: "#",
  zalo: "#",
};

export const FOOTER_CONTACT_LINKS = [
  {
    label: "Email",
    href: `mailto:${CONTACT.email}`,
    ariaLabel: "Email",
    iconKey: "mail",
    external: false,
  },
  {
    label: "GitHub",
    href: DEVELOPER.github,
    ariaLabel: "GitHub",
    iconKey: "github",
    external: true,
  },
  {
    label: "LinkedIn",
    href: DEVELOPER.linkedin,
    ariaLabel: "LinkedIn",
    iconKey: "linkedin",
    external: true,
  },
] as const;

export const FOOTER_DEVELOPER_LINKS = [
  {
    label: "GitHub",
    href: DEVELOPER.github,
  },
  {
    label: "LinkedIn",
    href: DEVELOPER.linkedin,
  },
] as const;

export const FOOTER_LINK_COLUMNS = [
  {
    title: "Điều hướng",
    links: [
      { label: "Trang chủ", href: routes.home() },
      { label: "Kho game", href: routes.games() },
      { label: "Nạp ví", href: routes.wallet() },
      { label: "Đơn hàng", href: routes.orders() },
    ],
  },
  {
    title: "Tài khoản",
    links: [
      { label: "Hồ sơ", href: routes.profile() },
      { label: "Đăng nhập", href: routes.login() },
      { label: "Đăng ký", href: routes.register() },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Lịch sử đơn", href: routes.orders() },
      { label: "Nạp ví", href: routes.wallet() },
      { label: "Kho game", href: routes.games() },
    ],
  },
] as const;
