import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames';
import { ROUTE_PATHS, routes } from '@/app/router/routes';
import { BrandLogo } from '@/app/site-shell/BrandLogo';
import { SITE } from '@/app/config/site';

export function AuthHeader() {
  const navigate = useNavigate();

  return (
    <header className="gt-shell-surface fixed inset-x-0 top-0 z-50 border-b gt-border backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <BrandLogo title={SITE.name} size="sm" onClick={() => navigate(ROUTE_PATHS.homeGuest)} />

        <Link
          to={routes.homeGuest()}
          className={classNames(
            'inline-flex items-center gap-2 text-sm font-medium gt-text-muted transition-colors duration-200',
            'hover:text-white focus-visible:outline-none focus-visible:text-white',
          )}
        >
          <ArrowLeft size={14} />
          Trang chủ
        </Link>
      </div>
    </header>
  );
}
