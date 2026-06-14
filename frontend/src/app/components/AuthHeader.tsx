import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames';
import { ROUTE_PATHS, routes } from '@/app/router/routes';
import { BrandLogo } from '@/app/site-shell/BrandLogo';
import { SITE } from '@/app/config/site';

export function AuthHeader() {
  const navigate = useNavigate();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[linear-gradient(180deg,rgba(5,10,20,0.96)_0%,rgba(5,10,20,0.86)_100%)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <BrandLogo title={SITE.name} size="sm" onClick={() => navigate(ROUTE_PATHS.home)} />

        <Link
          to={routes.home()}
          className={classNames(
            'inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors duration-200',
            'hover:text-slate-100 focus-visible:outline-none focus-visible:text-slate-100',
          )}
        >
          <ArrowLeft size={14} />
          Trang chủ
        </Link>
      </div>
    </header>
  );
}
