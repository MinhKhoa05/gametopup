import type { ReactNode } from 'react';

export type NavItem = {
  label: string;
  href: string;
};

export type HeaderAccountMenuItem = {
  className?: string;
  dividerAfter?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
};
