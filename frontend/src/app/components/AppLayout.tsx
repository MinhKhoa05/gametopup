import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isAdminRoutePath, isAuthRoutePath, isGameDetailRoutePath } from '@/app/router/routes';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import { AuthHeader } from './AuthHeader';
import { BottomNav } from './BottomNav';
import { SiteCredits } from './SiteCredits';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const isAdminRoute = isAdminRoutePath(location.pathname);
  const isAuthRoute = isAuthRoutePath(location.pathname);
  const isTopupRoute = isGameDetailRoutePath(location.pathname);
  const showBottomNav = !isAdminRoute && !isAuthRoute;
  const showFooter = showBottomNav && !isTopupRoute;

  return (
    <div className="gt-app-shell relative isolate flex min-h-screen flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--gt-bg)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent_18%),radial-gradient(circle_at_50%_-10%,rgba(56,189,248,0.12),transparent_34%)]" />
        <div className="absolute inset-0 gt-page-grid opacity-[0.05]" />
        <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(3,10,22,0.6),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(0deg,rgba(3,10,22,0.9),transparent)]" />
      </div>
      {!isAdminRoute && !isAuthRoute && <AppHeader />}
      {!isAdminRoute && isAuthRoute && <AuthHeader />}
      <main className={`flex flex-1 flex-col ${isAuthRoute ? 'pt-[4.5rem]' : ''}`}>
        {children}
      </main>
      {showFooter && <AppFooter />}
      <SiteCredits />
      {showBottomNav && <BottomNav />}
    </div>
  );
}
