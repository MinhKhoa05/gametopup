import { Facebook, Headset, Mail, MessageCircleMore, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  FOOTER_CONTACT_LINKS,
  FOOTER_DEVELOPER_LINKS,
  FOOTER_SERVICE_LINKS,
  FOOTER_SUPPORT_POINTS,
  SITE,
} from '@/app/config/site';
import { BrandLogo } from './BrandLogo';

const FOOTER_CONTACT_ICON_BY_KEY = {
  mail: <Mail size={18} />,
  facebook: <Facebook size={18} />,
  zalo: <MessageCircleMore size={18} />,
} as const;

const FOOTER_SUPPORT_ICON_BY_KEY = {
  headset: <Headset size={16} />,
  shield: <ShieldCheck size={16} />,
  zap: <Zap size={16} />,
} as const;

const FOOTER_ICON_BUTTON_CLASS =
  'inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/8 bg-white/5 text-slate-100 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-cyan/10 hover:text-cyan-50 focus-visible:-translate-y-px focus-visible:border-cyan/25 focus-visible:bg-cyan/10 focus-visible:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40';

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="mt-auto border-t border-slate-400/14 bg-[linear-gradient(180deg,rgba(9,19,35,0.6),rgba(7,17,31,0.92))] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-1.5 md:pb-0">
      <div className="site-footer__inner mx-auto grid max-w-7xl gap-12 px-4 py-8 sm:px-6 lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.9fr] lg:px-8 lg:py-8">
        <div className="grid gap-3">
          <BrandLogo className="w-fit" onClick={() => navigate('/')} title={SITE.name} subtitle={SITE.tagline} />
          <p className="m-0 max-w-md leading-7 text-slate-300">{SITE.footerDescription}</p>
        </div>

        <div>
          <h3 className="mb-3.5 text-lg font-black text-white">Dịch vụ</h3>
          <div className="grid gap-2.5">
            {FOOTER_SERVICE_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                className="w-fit border-0 bg-transparent p-0 text-left text-sm text-slate-300 hover:text-cyan"
                onClick={() => navigate(link.href)}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3.5 text-lg font-black text-white">Hỗ trợ</h3>
          <div className="grid gap-2.5">
            {FOOTER_SUPPORT_POINTS.map((point) => (
              <p key={point.label} className="m-0 inline-flex items-center gap-3 text-sm leading-6 text-slate-300">
                {FOOTER_SUPPORT_ICON_BY_KEY[point.iconKey]}
                {point.label}
              </p>
            ))}
          </div>
        </div>

        <div className="grid gap-2.5 self-start -mt-px">
          <div className="grid gap-2">
            <h3 className="mb-3.5 text-lg font-black text-white">Kết nối với chúng tôi</h3>
            <div className="flex flex-wrap items-center gap-3.5">
              {FOOTER_CONTACT_LINKS.map((link) => (
                <a
                  key={link.label}
                  className={FOOTER_ICON_BUTTON_CLASS}
                  href={link.href}
                  aria-label={link.label}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noreferrer' : undefined}
                  onClick={
                    !link.external
                      ? (event) => {
                          event.preventDefault();
                          window.location.href = link.href;
                        }
                      : undefined
                  }
                >
                  {FOOTER_CONTACT_ICON_BY_KEY[link.iconKey]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl justify-items-center gap-2 border-t border-white/5 px-4 py-3 sm:px-6 lg:px-8">
        <p className="m-0 text-sm text-slate-400">
          © {SITE.copyrightYear} {SITE.name}. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-slate-300">
          <span className="text-slate-400">Developed by {SITE.developerName}</span>
          <span className="text-slate-400" aria-hidden="true">
            •
          </span>
          {FOOTER_DEVELOPER_LINKS.map((link, index) => (
            <span key={link.label} className="inline-flex items-center gap-2">
              <a className="text-sky-300 underline underline-offset-4 transition-colors hover:text-sky-200" href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
              {index < FOOTER_DEVELOPER_LINKS.length - 1 ? <span className="text-slate-400" aria-hidden="true">•</span> : null}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
