import { Facebook, Headset, Mail, MessageCircleMore, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SITE } from '@/app/config/site';
import { routes } from '@/app/router/routes';
import { BrandLogo } from './BrandLogo';

const FOOTER_LINKS = {
  about: [
    { label: 'Giới thiệu', href: routes.home() },
    { label: 'Điều khoản', href: routes.home() },
    { label: 'Chính sách bảo mật', href: routes.home() },
    { label: 'Liên hệ', href: routes.home() },
  ],
  guide: [
    { label: 'Hướng dẫn nạp game', href: routes.games() },
    { label: 'Hướng dẫn nạp ví', href: routes.wallet() },
    { label: 'Câu hỏi thường gặp', href: routes.home() },
  ],
  support: [
    { label: 'Trung tâm hỗ trợ', href: routes.home() },
    { label: 'Ticket của tôi', href: routes.orders() },
    { label: 'Liên hệ hỗ trợ', href: routes.profile() },
  ],
} as const;

const FOOTER_SOCIALS = [
  { label: 'Email', href: `mailto:${SITE.contact.email}`, icon: <Mail size={18} /> },
  { label: 'Facebook', href: SITE.contact.facebook, icon: <Facebook size={18} /> },
  { label: 'Chat', href: SITE.contact.zalo, icon: <MessageCircleMore size={18} /> },
  { label: 'Security', href: routes.home(), icon: <ShieldCheck size={18} /> },
] as const;

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="mt-auto border-t border-white/10 bg-[linear-gradient(180deg,rgba(4,10,22,0.08),rgba(4,10,22,0.96))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-6 md:pb-0">
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 border-b border-white/10 pb-5 lg:grid-cols-[minmax(300px,1.15fr)_minmax(160px,0.55fr)_minmax(160px,0.55fr)_minmax(160px,0.55fr)_minmax(280px,0.9fr)] lg:gap-10">
          <div className="grid max-w-[320px] gap-2">
            <BrandLogo className="w-fit" onClick={() => navigate(routes.home())} title={SITE.name} subtitle={SITE.tagline} />
            <p className="max-w-[28ch] text-sm leading-6 text-slate-400 [text-wrap:balance]">Đại lý nạp game trung gian - Giá tốt - Xử lý nhanh - Hỗ trợ 24/7</p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {FOOTER_SOCIALS.slice(0, 4).map((social) => (
                <a
                  key={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/30 hover:bg-cyan/10 hover:text-cyan-50"
                  href={social.href}
                  aria-label={social.label}
                  target={social.label === 'Email' ? undefined : '_blank'}
                  rel={social.label === 'Email' ? undefined : 'noreferrer'}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <FooterLinkColumn title="Về chúng tôi" links={FOOTER_LINKS.about} onNavigate={navigate} />
          <FooterLinkColumn title="Hướng dẫn" links={FOOTER_LINKS.guide} onNavigate={navigate} />
          <FooterLinkColumn title="Hỗ trợ" links={FOOTER_LINKS.support} onNavigate={navigate} />

          <div className="grid max-w-[300px] gap-3">
            <h3 className="text-lg font-black text-white">Nhận thông báo</h3>
            <p className="max-w-[26ch] text-sm leading-6 text-slate-400 [text-wrap:balance]">Nhận tin khuyến mãi và cập nhật về game, gói nạp và các chương trình nổi bật.</p>

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
        </div>

        <div className="flex flex-col items-center justify-between gap-1.5 py-3.5 text-center text-sm text-slate-500 lg:flex-row lg:text-left">
          <span>© {SITE.copyrightYear} {SITE.name}. All rights reserved.</span>
          <span className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-slate-400">Developed by {SITE.developerName}</span>
            <Sparkles size={14} className="text-cyan-300" />
            <a className="text-cyan-300 transition-colors hover:text-cyan-100" href={SITE.contact.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="text-cyan-300 transition-colors hover:text-cyan-100" href={SITE.contact.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </span>
        </div>
      </div>
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
            className="w-fit border-0 bg-transparent p-0 text-left text-sm leading-6 text-slate-400 transition-colors hover:text-cyan-100"
            onClick={() => onNavigate(link.href)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}
