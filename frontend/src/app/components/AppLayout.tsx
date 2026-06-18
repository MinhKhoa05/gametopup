import type { ReactNode } from 'react';
import { AppBackground } from './AppBackground';

type AppLayoutProps = {
  bottomNav?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  authHeader?: ReactNode;
  isAdminRoute?: boolean;
  isAuthRoute?: boolean;
};

export function AppLayout({
  bottomNav,
  children,
  footer,
  header,
  authHeader,
  isAdminRoute = false,
  isAuthRoute = false,
}: AppLayoutProps) {
  return (
    <div className="gt-app-shell relative isolate flex min-h-screen flex-col">
      <AppBackground />
      {!isAdminRoute && !isAuthRoute && header}
      {!isAdminRoute && isAuthRoute && authHeader}
      <main className={`flex flex-1 flex-col pb-[env(safe-area-inset-bottom,0px)] ${isAuthRoute ? 'pt-[4.5rem]' : ''}`}>{children}</main>
      {!isAdminRoute && !isAuthRoute && footer}
      {!isAdminRoute && !isAuthRoute && bottomNav}
    </div>
  );
}
