import { Link } from 'react-router-dom';
import { FOOTER_DEVELOPER_LINKS, SITE } from '@/app/config/site';
import { routes } from '@/app/router/routes';

export function SiteCredits() {
  return (
    <div className="border-t border-white/5 bg-[linear-gradient(180deg,rgba(4,10,22,0.88),rgba(4,10,22,0.98))] pt-5 text-sm text-slate-400">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col items-center gap-3 px-4 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
          <span>Â© {SITE.copyrightYear}</span>
          <Link to={routes.home()} className="font-semibold text-slate-300 transition-colors hover:text-slate-100">
            {SITE.name}
          </Link>
          <span>All rights reserved.</span>
        </span>

        <span className="flex flex-wrap items-center justify-center gap-2 font-medium text-slate-400 sm:justify-end">
          <span>Developed by {SITE.developerName}</span>
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
