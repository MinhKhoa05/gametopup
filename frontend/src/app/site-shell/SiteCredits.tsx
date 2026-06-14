import { Link } from 'react-router-dom';
import { FOOTER_DEVELOPER_LINKS, SITE } from '@/app/config/site';
import { routes } from '@/app/router/routes';

export function SiteCredits() {
  return (
    <div className="border-t border-white/8 pt-4 text-xs text-slate-500">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col items-center gap-2 px-4 text-center sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <span className="flex flex-wrap items-center justify-center gap-1">
          <span>© {SITE.copyrightYear}</span>
          <Link to={routes.home()} className="font-medium text-slate-400 transition-colors hover:text-slate-200">
            {SITE.name}
          </Link>
          <span>All rights reserved.</span>
        </span>

        <span className="flex flex-wrap items-center justify-center gap-2 font-medium text-slate-400">
          <span>Developed by {SITE.developerName}</span>
          {FOOTER_DEVELOPER_LINKS.map((link) => (
            <a
              key={link.label}
              className="text-slate-400 transition-colors hover:text-slate-200"
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
