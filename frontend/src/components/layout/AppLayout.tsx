import type { ReactNode } from 'react';

type AppLayoutProps = {
  bottomNav?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  isAdminRoute?: boolean;
  toast?: ReactNode;
};

export function AppLayout({ bottomNav, children, footer, header, isAdminRoute = false, toast }: AppLayoutProps) {
  return (
    <div className="main-layout bg-ink text-slate-100">
      {!isAdminRoute && header}

      <main className="main-content">{children}</main>

      {!isAdminRoute && footer}
      {!isAdminRoute && bottomNav}
      {toast}
    </div>
  );
}
