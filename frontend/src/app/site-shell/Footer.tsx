import { Facebook, Mail, MessageCircleMore, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SITE, FOOTER_CONTACT_LINKS } from '@/app/config/site';
import { routes } from '@/app/router/routes';
import { classNames } from '@/shared/lib/classNames';
import { BrandLogo } from './BrandLogo';
import { SiteCredits } from './SiteCredits';

type FooterVariant = 'full' | 'minimal';

const FOOTER_LINKS = {
  about: [
    { label: 'Trang chủ', href: routes.home() },
    { label: 'Kho game', href: routes.games() },
    { label: 'Nạp ví', href: routes.wallet() },
    { label: 'Đơn hàng', href: routes.orders() },
  ],
  guide: [
    { label: 'Hồ sơ', href: routes.profile() },
    { label: 'Đăng nhập', href: routes.login() },
    { label: 'Đăng ký', href: routes.register() },
  ],
  support: [
    { label: 'Lịch sử đơn', href: routes.orders() },
    { label: 'Nạp ví', href: routes.wallet() },
    { label: 'Kho game', href: routes.games() },
  ],
} as const;

export function Footer({ variant = 'full' }: { variant?: FooterVariant }) {
  const navigate = useNavigate();
  const isMinimal = variant === 'minimal';

  const shellClassName = classNames(
    'mt-auto border-t border-white/10 bg-[linear-gradient(180deg,rgba(4,10,22,0.08),rgba(4,10,22,0.96))]',
    'pt-12 sm:pt-14',
    isMinimal ? 'pb-[calc(3rem+env(safe-area-inset-bottom,0px))]' : 'pb-[calc(4rem+env(safe-area-inset-bottom,0px))]',
  );

  return (
    <footer className={shellClassName}>
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        <div
          className={classNames(
            'grid gap-8 border-b border-white/10 pb-8 lg:gap-10',
            isMinimal
              ? 'lg:grid-cols-[minmax(300px,1fr)_minmax(160px,0.52fr)_minmax(160px,0.52fr)_minmax(160px,0.52fr)]'
              : 'lg:grid-cols-[minmax(300px,1fr)_minmax(160px,0.48fr)_minmax(160px,0.48fr)_minmax(160px,0.48fr)_minmax(360px,1.25fr)]',
          )}
        >
          <div className="grid max-w-[320px] gap-2">
            <BrandLogo className="w-fit" onClick={() => navigate(routes.home())} title={SITE.name} subtitle={SITE.tagline} />
            <p className="max-w-[28ch] text-sm leading-6 text-slate-400 [text-wrap:balance]">{SITE.footerDescription}</p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {FOOTER_CONTACT_LINKS.map((social) => {
                const Icon = getSocialIcon(social.label);
                return (
                  <a
                    key={social.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/40 hover:bg-cyan/10 hover:text-cyan-50"
                    href={social.href}
                    aria-label={social.ariaLabel}
                    target={social.external ? '_blank' : undefined}
                    rel={social.external ? 'noreferrer' : undefined}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          <FooterLinkColumn title="Về chúng tôi" links={FOOTER_LINKS.about} onNavigate={navigate} />

          {isMinimal ? (
            <>
              <FooterLinkColumn title="Hướng dẫn" links={FOOTER_LINKS.guide} onNavigate={navigate} />
              <FooterLinkColumn title="Hỗ trợ" links={FOOTER_LINKS.support} onNavigate={navigate} />
            </>
          ) : (
            <>
              <FooterLinkColumn title="Hướng dẫn" links={FOOTER_LINKS.guide} onNavigate={navigate} />
              <FooterLinkColumn title="Hỗ trợ" links={FOOTER_LINKS.support} onNavigate={navigate} />

              <div className="grid w-full max-w-none gap-3 lg:justify-self-start lg:pl-6 xl:pl-8">
                <h3 className="text-lg font-black text-white">Nhận thông báo</h3>
                <p className="max-w-[36ch] text-sm leading-6 text-slate-400 [text-wrap:balance]">
                  Nhận tin khuyến mãi và cập nhật về game, gói nạp và các chương trình nổi bật.
                </p>

                <label className="flex h-10 items-center gap-3 rounded-[14px] border border-white/10 bg-[rgba(7,16,31,0.78)] px-4 text-slate-300 transition-all duration-200 hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.92)] focus-within:border-cyan/60 focus-within:bg-[rgba(15,29,51,0.92)]">
                  <input
                    type="email"
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                    placeholder="Nhập email của bạn"
                    aria-label="Nhập email của bạn"
                  />
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-cyan-400 text-slate-950">
                    <Zap size={15} />
                  </span>
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      <SiteCredits />
    </footer>
  );
}

function FooterLinkColumn({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <div className="grid gap-2">
        {links.map((link) => (
          <button
            key={link.label}
            type="button"
            className="w-fit border-0 bg-transparent p-0 text-left text-sm leading-6 text-slate-400 transition-colors hover:text-white"
            onClick={() => onNavigate(link.href)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function getSocialIcon(label: string) {
  switch (label) {
    case 'Email':
      return Mail;
    case 'Facebook':
      return Facebook;
    case 'Zalo':
      return MessageCircleMore;
    default:
      return ShieldCheck;
  }
}
