import { Facebook, Headset, Mail, MessageCircleMore, ShieldCheck, Zap } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Route } from '../../lib/routes';
import {
  FOOTER_CONTACT_LINKS,
  FOOTER_DEVELOPER_LINKS,
  FOOTER_SERVICE_LINKS,
  FOOTER_SUPPORT_POINTS,
  getFooterCopyright,
  SITE,
} from '../../config/site';

const contactIcons = {
  mail: <Mail size={20} />,
  facebook: <Facebook size={20} />,
  message: <MessageCircleMore size={20} />,
} as const;

export function AppFooter({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <footer className="app-footer mt-auto">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-8 sm:px-6 lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.9fr] lg:px-8 lg:py-8">
        <div className="footer-brand-block">
          <BrandLogo onClick={() => navigate({ name: 'home' })} title={SITE.name} subtitle={SITE.tagline} />
          <p>{SITE.footerDescription}</p>
        </div>

        <div>
          <h3>Dịch vụ</h3>
          <div className="footer-links">
            {FOOTER_SERVICE_LINKS.map((link) => (
              <button key={link.label} type="button" onClick={() => navigate(link.route)}>
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3>Hỗ trợ</h3>
          <div className="footer-support">
            {FOOTER_SUPPORT_POINTS.map((point, index) => (
              <p key={point}>
                {index === 0 ? <ShieldCheck size={16} /> : index === 1 ? <Zap size={16} /> : <Headset size={16} />}
                {point}
              </p>
            ))}
          </div>
        </div>

        <div className="footer-contact-block">
          <div className="footer-contact-group">
            <h3>Kết nối với chúng tôi</h3>
            <div className="footer-icon-links">
              {FOOTER_CONTACT_LINKS.map((link) => (
                <a
                  key={link.label}
                  className="footer-icon-link"
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
      <div className="border-t border-white/5 py-3">
        <p className="m-0 text-[0.96rem] text-slate-400">{getFooterCopyright()}</p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[0.95rem] font-bold text-slate-300">
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
