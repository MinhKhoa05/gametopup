import { Boxes, CalendarDays, ChevronRight, History, LayoutDashboard, Menu, MoonStar, Settings2, Users, WalletCards, X } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { Badge, Button, EmptyState, IconBox, SearchBar } from '@/shared/components';
import { BrandLogo } from '@/app/site-shell/BrandLogo';
import { HeaderAccountMenu } from '@/app/site-shell/HeaderAccountMenu';
import { classNames } from '@/shared/lib/classNames';
import { SITE } from '@/app/config/site';
import type { AdminSection } from '@/app/router/routes';
import type { HeaderAccountMenuItem } from '@/shared/types/layout';

const ADMIN_NAV_ITEMS: Array<{ icon: ReactNode; label: string; section: AdminSection }> = [
  { section: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Tổng quan' },
  { section: 'games', icon: <Boxes size={18} />, label: 'Quản lý game' },
  { section: 'packages', icon: <Boxes size={18} />, label: 'Gói nạp' },
  { section: 'orders', icon: <WalletCards size={18} />, label: 'Đơn hàng' },
  { section: 'deposits', icon: <WalletCards size={18} />, label: 'Nạp tiền' },
  { section: 'users', icon: <Users size={18} />, label: 'Người dùng' },
];

const ADMIN_SECTION_META: Record<AdminSection, { description: string; label: string }> = {
  dashboard: { label: 'Tổng quan', description: 'Theo dõi hoạt động và số liệu hệ thống theo thời gian thực.' },
  games: { label: 'Quản lý game', description: 'Cập nhật danh sách game, trạng thái hoạt động và thông tin hiển thị.' },
  packages: { label: 'Gói nạp', description: 'Quản lý các gói nạp theo từng game và kiểm soát trạng thái hiển thị.' },
  orders: { label: 'Đơn hàng', description: 'Kiểm tra, xử lý và theo dõi các đơn hàng gần đây.' },
  deposits: { label: 'Nạp tiền', description: 'Duyệt hoặc từ chối các yêu cầu nạp tiền đã được khách hàng xác nhận.' },
  users: { label: 'Người dùng', description: 'Quản lý người dùng, trạng thái hoạt động và quyền truy cập.' },
};

export function AdminAccessDenied({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#061224] px-4 py-6 text-slate-100">
      <EmptyState
        className="max-w-[560px] py-10"
        icon={
          <IconBox size="lg">
            <LayoutDashboard size={26} />
          </IconBox>
        }
        title="Cần quyền quản trị"
        description="Bạn cần đăng nhập bằng tài khoản quản trị để truy cập khu vực này."
        actionLabel="Đăng nhập"
        onAction={onLogin}
      />
    </div>
  );
}

export function AdminSectionShell({
  activeSection,
  busy,
  children,
  loading,
}: {
  activeSection: AdminSection;
  busy: boolean;
  children: ReactNode;
  loading: boolean;
}) {
  const meta = ADMIN_SECTION_META[activeSection];

  return (
    <div className="grid min-w-0 gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <section className="grid gap-4 border-b border-white/[0.06] pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid min-w-0 gap-2">
            <div className="grid gap-1">
              <p className="gt-eyebrow">Admin</p>
              <h1 className="m-0 text-[clamp(2rem,2.8vw,3rem)] font-black leading-[1.04] tracking-[-0.04em] text-white">{meta.label}</h1>
              <p className="m-0 max-w-3xl text-sm leading-[1.55] text-slate-400 sm:text-[0.96rem]">{meta.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button size="sm" variant="outline" className="rounded-full border-white/8 bg-white/[0.03] px-4 text-slate-200 hover:bg-white/[0.06] hover:text-white">
              <CalendarDays size={14} />
              7 ngày qua
            </Button>

            <Badge variant={busy || loading ? 'accent' : 'success'} icon={<LayoutDashboard size={14} />} className="rounded-full px-3.5 py-2">
              {busy || loading ? 'Đang đồng bộ' : 'Sẵn sàng'}
            </Badge>
          </div>
        </div>
      </section>

      {children}
    </div>
  );
}

export function AdminDesktopLayout({
  activeSection,
  brandCollapsed,
  children,
  loading,
  onBrandClick,
  onNavigate,
  onRefresh,
  onToggleSidebar,
  userName,
  accountMenuItems,
}: {
  activeSection: AdminSection;
  accountMenuItems: HeaderAccountMenuItem[];
  brandCollapsed: boolean;
  children: ReactNode;
  loading: boolean;
  onBrandClick: () => void;
  onNavigate: (section: AdminSection) => void;
  onRefresh: () => void;
  onToggleSidebar: () => void;
  userName: string;
}) {
  const [searchValue, setSearchValue] = useState('');
  const sidebarWidth = brandCollapsed ? '92px' : '300px';

  return (
    <div
      className="hidden min-h-screen w-full lg:grid"
      style={
        {
          '--admin-sidebar-width': sidebarWidth,
          gridTemplateColumns: 'var(--admin-sidebar-width) minmax(0,1fr)',
          gridTemplateRows: '96px minmax(0,1fr)',
        } as CSSProperties
      }
    >
      <div className={classNames('sticky top-0 z-40 flex items-center border-b border-r border-white/[0.06] bg-[#071427]/95 px-6 py-4 lg:px-7', brandCollapsed ? 'justify-center' : 'justify-start')}>
        <BrandLogo
          adminDot
          collapsed={brandCollapsed}
          onClick={onBrandClick}
          size="lg"
          subtitle="Quản lý và vận hành dịch vụ"
          title={SITE.adminName}
        />
      </div>

      <header className="sticky top-0 z-40 flex items-center border-b border-white/[0.06] bg-[#071427]/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 lg:max-w-[720px] xl:max-w-[920px]">
            <button
              type="button"
              aria-label="Đóng hoặc mở sidebar"
              className="gt-interactive hidden size-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] text-slate-100 shadow-[0_10px_24px_rgba(2,6,23,0.18)] transition-colors hover:border-cyan/20 hover:bg-[linear-gradient(180deg,rgba(34,211,238,0.14),rgba(34,211,238,0.06))] hover:text-white lg:inline-flex"
              onClick={onToggleSidebar}
            >
              <Menu size={16} strokeWidth={2.4} />
            </button>

            <SearchBar
              dense
              ariaLabel="Tìm kiếm nhanh"
              className="min-w-0 flex-1"
              onChange={setSearchValue}
              placeholder="Tìm kiếm nhanh..."
              size={16}
              value={searchValue}
            />
          </div>

          <div className="ml-auto flex flex-none items-center gap-2">
            <button
              type="button"
              className="gt-interactive inline-flex size-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] text-slate-300 transition-colors hover:border-cyan/20 hover:bg-cyan/10 hover:text-white"
              onClick={onRefresh}
              title="Làm mới"
            >
              <CalendarDays size={17} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              type="button"
              className="gt-interactive inline-flex size-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] text-slate-300 transition-colors hover:border-cyan/20 hover:bg-cyan/10 hover:text-white"
              title="Thông báo"
            >
              <MoonStar size={17} />
            </button>

            <HeaderAccountMenu items={accountMenuItems} triggerLabel={userName} />
          </div>
        </div>
      </header>

      <AdminSidebarDesktop activeSection={activeSection} collapsed={brandCollapsed} onNavigate={onNavigate} />

      <main className="min-w-0 overflow-auto lg:col-start-2 lg:row-start-2">{children}</main>
    </div>
  );
}

export function AdminMobileLayout({
  activeSection,
  children,
  isOpen,
  loading,
  onBrandClick,
  onCloseSidebar,
  onNavigate,
  onRefresh,
  onToggleSidebar,
  userName,
  accountMenuItems,
}: {
  activeSection: AdminSection;
  accountMenuItems: HeaderAccountMenuItem[];
  children: ReactNode;
  isOpen: boolean;
  loading: boolean;
  onBrandClick: () => void;
  onCloseSidebar: () => void;
  onNavigate: (section: AdminSection) => void;
  onRefresh: () => void;
  onToggleSidebar: () => void;
  userName: string;
}) {
  return (
    <div className="lg:hidden">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#071427]/95 px-4 py-3 backdrop-blur-xl">
        <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          <button
            type="button"
            aria-label="Đóng hoặc mở sidebar"
            className="gt-interactive inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] text-slate-100 shadow-[0_10px_24px_rgba(2,6,23,0.18)] transition-colors hover:border-cyan/20 hover:bg-[linear-gradient(180deg,rgba(34,211,238,0.14),rgba(34,211,238,0.06))] hover:text-white"
            onClick={onToggleSidebar}
          >
            <Menu size={16} strokeWidth={2.4} />
          </button>

          <div className="min-w-0">
            <BrandLogo
              adminDot
              onClick={onBrandClick}
              size="sm"
              subtitle="Quản lý và vận hành dịch vụ"
              title={SITE.adminName}
            />
          </div>

          <div className="ml-auto flex flex-none items-center gap-2">
            <button
              type="button"
              className="gt-interactive inline-flex size-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] text-slate-300 transition-colors hover:border-cyan/20 hover:bg-cyan/10 hover:text-white"
              onClick={onRefresh}
              title="Làm mới"
            >
              <CalendarDays size={17} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              type="button"
              className="gt-interactive inline-flex size-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] text-slate-300 transition-colors hover:border-cyan/20 hover:bg-cyan/10 hover:text-white"
              title="Thông báo"
            >
              <MoonStar size={17} />
            </button>

            <HeaderAccountMenu items={accountMenuItems} triggerLabel={userName} />
          </div>
        </div>
      </header>

      <AdminSidebarMobile activeSection={activeSection} isOpen={isOpen} onClose={onCloseSidebar} onNavigate={onNavigate} />

      <main className="min-w-0">{children}</main>
    </div>
  );
}

function AdminSidebarDesktop({
  activeSection,
  collapsed,
  onNavigate,
}: {
  activeSection: AdminSection;
  collapsed: boolean;
  onNavigate: (section: AdminSection) => void;
}) {
  const compact = collapsed;

  return (
    <aside aria-label="Điều hướng quản trị" className="flex min-h-0 flex-col gap-4 overflow-hidden border-r border-white/[0.06] bg-[#071427]/95 px-3 py-3 backdrop-blur-xl">
      <nav className="grid gap-1">
        {ADMIN_NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.section}
            active={activeSection === item.section}
            collapsed={compact}
            icon={item.icon}
            label={item.label}
            onClick={() => onNavigate(item.section)}
          />
        ))}
      </nav>

      <div className={classNames('grid gap-1.5 border-t border-white/[0.06]', compact ? 'pt-3' : 'mt-4 pt-4')}>
        {!compact ? <div className="px-2 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Hệ thống</div> : null}
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

function AdminSidebarMobile({
  activeSection,
  isOpen,
  onClose,
  onNavigate,
}: {
  activeSection: AdminSection;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: AdminSection) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
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
            title={SITE.adminName}
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
          {ADMIN_NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.section}
              active={activeSection === item.section}
              icon={item.icon}
              label={item.label}
              onClick={() => onNavigate(item.section)}
            />
          ))}
        </nav>

        <div className="mt-4 grid gap-1.5 border-t border-white/[0.06] pt-4">
          <div className="px-2 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Hệ thống</div>
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

function SidebarNavItem({
  active = false,
  collapsed = false,
  icon,
  label,
  onClick,
  secondary = false,
}: {
  active?: boolean;
  collapsed?: boolean;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  secondary?: boolean;
}) {
  const content = (
    <>
      <span
        className={classNames(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border transition-colors',
          secondary
            ? 'border-white/[0.06] bg-white/[0.03] text-slate-400'
            : active
              ? 'border-cyan/20 bg-cyan/10 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.10)]'
              : 'border-white/[0.06] bg-white/[0.03] text-slate-300',
        )}
      >
        {icon}
      </span>
      {collapsed ? null : (
        <span className="min-w-0 flex-1 text-left">
          <span className={classNames('block truncate text-sm font-semibold', secondary ? 'text-slate-400' : active ? 'text-white' : 'text-slate-200')}>
            {label}
          </span>
        </span>
      )}
    </>
  );

  const baseClassName = classNames(
    'flex min-h-12 items-center gap-3 rounded-[14px] border px-3 py-2 text-left transition-colors',
    secondary
      ? 'border-transparent bg-transparent text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
      : active
        ? 'border-cyan/15 bg-cyan/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.08)]'
        : 'border-transparent bg-transparent text-slate-300 hover:border-white/[0.06] hover:bg-white/[0.03] hover:text-white',
    collapsed && 'justify-center px-2',
  );

  if (!onClick) {
    return (
      <div className={baseClassName} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <button type="button" className={baseClassName} onClick={onClick}>
      {content}
      {!collapsed && !secondary ? <ChevronRight size={16} className="ml-auto text-slate-500" /> : null}
    </button>
  );
}
