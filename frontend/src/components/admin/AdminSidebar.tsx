import { Boxes, Gamepad2, History, LayoutDashboard, MoonStar, ReceiptText, Settings2, Users, WalletCards, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { SITE } from '../../config/site';
import { classNames } from '../../lib/ui';
import { BrandLogo } from '../layout/BrandLogo';
import { SidebarNavItem } from './SidebarNavItem';

export type AdminSection = 'dashboard' | 'games' | 'packages' | 'orders' | 'deposits' | 'users';

const adminNavItems: Array<{ section: AdminSection; icon: ReactNode; label: string }> = [
  { section: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Tổng quan' },
  { section: 'games', icon: <Gamepad2 size={18} />, label: 'Quản lý game' },
  { section: 'packages', icon: <Boxes size={18} />, label: 'Gói nạp' },
  { section: 'orders', icon: <ReceiptText size={18} />, label: 'Đơn hàng' },
  { section: 'deposits', icon: <WalletCards size={18} />, label: 'Nạp tiền' },
  { section: 'users', icon: <Users size={18} />, label: 'Người dùng' },
];

type AdminSidebarProps = {
  activeSection: AdminSection;
  className?: string;
  collapsed?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate: (section: AdminSection) => void;
  variant?: 'desktop' | 'mobile';
};

export function AdminSidebar({
  activeSection,
  className,
  collapsed = false,
  isOpen = true,
  onClose,
  onNavigate,
  variant = 'desktop',
}: AdminSidebarProps) {
  const compact = variant === 'desktop' && collapsed;

  if (variant === 'mobile') {
    if (!isOpen) {
      return null;
    }

    return (
      <div className={classNames('fixed inset-0 z-50 lg:hidden', className)}>
        <button
          type="button"
          aria-label="Đóng sidebar"
          className="absolute inset-0 bg-[#020816]/70 backdrop-blur-[2px]"
          onClick={onClose}
        />

        <aside
          aria-label="Điều hướng quản trị"
          className="relative z-10 flex h-full w-[min(88vw,320px)] flex-col border-r border-white/[0.06] bg-[#071427]/98 px-4 py-4 shadow-[24px_0_56px_rgba(2,6,23,0.4)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-4">
            <BrandLogo
              adminDot
              className="min-w-0 flex-1"
              onClick={() => onNavigate('dashboard')}
              size="lg"
              showTextOnMobile
              subtitle="Quản lý và vận hành dịch vụ"
              title={`${SITE.name} Admin`}
            />

            <button
              type="button"
              aria-label="Đóng sidebar"
              className="gt-interactive inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] text-slate-300 transition-colors hover:border-cyan/20 hover:bg-cyan/10 hover:text-white"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>

          <nav className="mt-4 grid gap-1">
            {adminNavItems.map((item) => (
              <SidebarNavItem
                key={item.label}
                active={activeSection === item.section}
                icon={item.icon}
                label={item.label}
                onClick={() => onNavigate(item.section)}
              />
            ))}
          </nav>

          <div className="mt-4 grid gap-1.5 border-t border-white/[0.06] pt-4">
            <div className="px-2 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Hệ thống
            </div>
            <SidebarNavItem icon={<Settings2 size={17} />} label="Cài đặt" secondary />
            <SidebarNavItem icon={<History size={17} />} label="Nhật ký hoạt động" secondary />
          </div>

          <div className="mt-auto border-t border-white/[0.06] pt-4">
            <div className="flex items-center justify-between gap-3 rounded-[14px] border border-white/[0.05] bg-white/[0.03] px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <MoonStar size={15} className="text-slate-300" />
                <span className="text-sm font-medium text-slate-200">Chế độ tối</span>
              </div>
              <button
                type="button"
                aria-label="Chế độ tối"
                className="relative h-7 w-12 rounded-full border border-cyan/20 bg-cyan/90 p-0.5 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
                disabled
              >
                <span className="block size-6 rounded-full bg-white shadow-[0_2px_10px_rgba(15,23,42,0.26)]" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <aside
      aria-label="Điều hướng quản trị"
      className={classNames(
        'flex min-h-0 flex-col gap-4 overflow-hidden border-r border-white/[0.06] bg-[#071427]/95 px-3 py-3 backdrop-blur-xl',
        className,
      )}
    >
      <nav className="grid gap-1">
        {adminNavItems.map((item) => (
          <SidebarNavItem
            key={item.label}
            active={activeSection === item.section}
            collapsed={compact}
            icon={item.icon}
            label={item.label}
            onClick={() => onNavigate(item.section)}
          />
        ))}
      </nav>

      <div className={classNames('grid gap-1.5 border-t border-white/[0.06]', compact ? 'pt-3' : 'mt-4 pt-4')}>
        {!compact ? (
          <div className="px-2 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Hệ thống
          </div>
        ) : null}
        <SidebarNavItem collapsed={compact} icon={<Settings2 size={17} />} label="Cài đặt" secondary />
        <SidebarNavItem collapsed={compact} icon={<History size={17} />} label="Nhật ký hoạt động" secondary />
      </div>

      {compact ? (
        <button
          type="button"
          aria-label="Chế độ tối"
          className="relative mx-auto mt-auto h-7 w-12 rounded-full border border-cyan/20 bg-cyan/90 p-0.5 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
          disabled
        >
          <span className="block size-6 rounded-full bg-white shadow-[0_2px_10px_rgba(15,23,42,0.26)]" />
        </button>
      ) : (
        <div className="mt-auto flex items-center justify-between gap-3 rounded-[14px] border border-white/[0.05] bg-white/[0.03] px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <MoonStar size={15} className="text-slate-300" />
            <span className="text-sm font-medium text-slate-200">Chế độ tối</span>
          </div>
          <button
            type="button"
            aria-label="Chế độ tối"
            className="relative h-7 w-12 rounded-full border border-cyan/20 bg-cyan/90 p-0.5 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
            disabled
          >
            <span className="block size-6 rounded-full bg-white shadow-[0_2px_10px_rgba(15,23,42,0.26)]" />
          </button>
        </div>
      )}
    </aside>
  );
}
