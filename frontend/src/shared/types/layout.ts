import type { ReactNode } from 'react';

export type NavItem = {
  label: string;
  href: string;
};

export type MenuItem = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  danger?: boolean;
  dividerAfter?: boolean;
};

export type HeaderAccountMenuItem = {
  className?: string;
  dividerAfter?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

export type HeaderMenuItemConfig = {
  className?: string;
  dividerAfter?: boolean;
  label: string;
  href?: string;
};
