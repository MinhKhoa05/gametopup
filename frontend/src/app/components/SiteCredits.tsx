import { Link } from 'react-router-dom';
import { DEVELOPER, FOOTER_DEVELOPER_LINKS } from '@/app/config';

import { routes } from '@/app/router/routes';

export function SiteCredits() {
  return (
    <div className="gt-shell-surface border-t gt-border py-5 text-sm gt-text-muted">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col items-center gap-3 px-4 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
          <span>© 2026</span>
          <Link to={routes.home()} className="font-semibold gt-text-soft transition-colors hover:text-white">
            GameTopUp
          </Link>
          <span>Mọi quyền được bảo lưu.</span>
        </span>

        <span className="flex flex-wrap items-center justify-center gap-2 font-medium gt-text-muted sm:justify-end">
          <span>Phát triển bởi {DEVELOPER.name}</span>
          {FOOTER_DEVELOPER_LINKS.map((link) => (
          <a
            key={link.label}
            className="text-cyan-200/85 transition-colors hover:text-cyan-100"
            href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </span>
      </div>
    </div>
  );
}
