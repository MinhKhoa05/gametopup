import { Facebook, Headset, Mail, MessageCircleMore, ShieldCheck, Zap } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useRoute } from '@/hooks/common/route.hooks';
import {
  FOOTER_CONTACT_LINKS,
  FOOTER_DEVELOPER_LINKS,
  FOOTER_SERVICE_LINKS,
  FOOTER_SUPPORT_POINTS,
  getFooterCopyright,
  SITE,
} from '@/config/site';

const contactIcons = {
  mail: <Mail size={20} />,
  facebook: <Facebook size={20} />,
  message: <MessageCircleMore size={20} />,
} as const;

const supportPointIcons = [<ShieldCheck size={16} />, <Zap size={16} />, <Headset size={16} />] as const;

export function AppFooter() {
  const { navigate } = useRoute();

  return (
    <footer className="mt-auto border-t border-slate-400/14 bg-[linear-gradient(180deg,rgba(9,19,35,0.6),rgba(7,17,31,0.92))] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-1.5 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-8 sm:px-6 lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.9fr] lg:px-8 lg:py-8">
        <div className="grid gap-3">
          <BrandLogo className="w-fit" onClick={() => navigate({ name: 'home' })} title={SITE.name} subtitle={SITE.tagline} />
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
                onClick={() => navigate(link.route)}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3.5 text-lg font-black text-white">Hỗ trợ</h3>
          <div className="grid gap-2.5">
            {FOOTER_SUPPORT_POINTS.map((point, index) => (
              <p key={point} className="m-0 inline-flex items-center gap-3 text-sm leading-6 text-slate-300">
                {supportPointIcons[index]}
                {point}
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
                className={getContactLinkClassName(link.icon)}
                href={link.href}
                aria-label={link.ariaLabel}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
                  onClick={
                    link.icon === 'mail'
                      ? (event) => {
                          event.preventDefault();
                          window.location.href = link.href;
                        }
                      : undefined
                  }
                >
                  {contactIcons[link.icon]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid justify-items-center gap-2 border-t border-white/5 py-3">
        <p className="m-0 text-sm text-slate-400">{getFooterCopyright()}</p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-slate-300">
          <span className="text-slate-400">Developed by {SITE.developerName}</span>
          <span className="text-slate-400" aria-hidden="true">
            •
          </span>
          <a
            className="text-sky-300 underline underline-offset-4 transition-colors hover:text-sky-200"
            href={FOOTER_DEVELOPER_LINKS[0].href}
            target="_blank"
            rel="noreferrer"
          >
            {FOOTER_DEVELOPER_LINKS[0].label}
          </a>
          <span className="text-slate-400" aria-hidden="true">
            •
          </span>
          <a
            className="text-sky-300 underline underline-offset-4 transition-colors hover:text-sky-200"
            href={FOOTER_DEVELOPER_LINKS[1].href}
            target="_blank"
            rel="noreferrer"
          >
            {FOOTER_DEVELOPER_LINKS[1].label}
          </a>
        </div>
      </div>
    </footer>
  );
}

function getContactLinkClassName(icon: 'facebook' | 'mail' | 'message') {
  const base = 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-400/20 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-transform transition-colors hover:-translate-y-0.5 hover:border-cyan/25 hover:bg-cyan/10';

  if (icon === 'mail') return `${base} bg-gradient-to-br from-blue-600 to-blue-500`;
  if (icon === 'facebook') return `${base} bg-gradient-to-br from-indigo-500 to-violet-500`;
  return `${base} bg-gradient-to-br from-red-500 to-red-600`;
}
