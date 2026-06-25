import { Boxes, CalendarDays, ChevronRight, LayoutDashboard, Menu, Users, WalletCards, X } from 'lucide-react';
import { type CSSProperties, type ReactNode } from 'react';
import { Badge, EmptyState, IconBox, BrandLogo, HeaderAccountMenu} from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import type { AdminSection } from '@/app/router/routes';
import type { HeaderMenuItem } from '@/app/config';

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
    <div className="flex min-h-screen items-center justify-center bg-[var(--gt-bg)] px-4 py-6 gt-text">
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

  if (activeSection === 'dashboard') {
    return <div className="grid min-w-0 gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">{children}</div>;
  }

  return (
    <div className="grid min-w-0 gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <section className="grid gap-4 border-b gt-border pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid min-w-0 gap-2">
            <div className="grid gap-1">
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] gt-text-soft">Admin</p>
              <h1 className="m-0 text-[clamp(2rem,2.8vw,3rem)] font-black leading-[1.04] tracking-[-0.04em] text-white">{meta.label}</h1>
              <p className="m-0 max-w-3xl text-sm leading-[1.55] gt-text-muted sm:text-[0.96rem]">{meta.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <span className="inline-flex min-h-9 items-center gap-2 rounded-full border gt-border bg-[var(--gt-card)] px-4 text-sm font-semibold gt-text-soft">
              <CalendarDays size={14} />
              7 ngày qua
            </span>

            {busy || loading ? (
              <Badge tone="primary" icon={<LayoutDashboard size={14} />} className="rounded-full px-3.5 py-2">
                Đang đồng bộ
              </Badge>
            ) : null}
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
  accountMenuItems: HeaderMenuItem[];
  brandCollapsed: boolean;
  children: ReactNode;
  loading: boolean;
  onBrandClick: () => void;
  onNavigate: (section: AdminSection) => void;
  onRefresh: () => void;
  onToggleSidebar: () => void;
  userName: string;
}) {
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
      <div className={classNames('sticky top-0 z-40 flex items-center border-b border-r gt-border bg-[var(--gt-shell)] px-6 py-4 lg:px-7', brandCollapsed ? 'justify-center' : 'justify-start')}>
        <BrandLogo
          adminDot
          collapsed={brandCollapsed}
          onClick={onBrandClick}
          size="lg"
        />
      </div>

      <header className="sticky top-0 z-40 flex items-center border-b gt-border bg-[var(--gt-shell)]/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              aria-label="Đóng hoặc mở sidebar"
              className="gt-button gt-button-secondary hidden size-10 shrink-0 items-center justify-center rounded-[18px] gt-text-soft lg:inline-flex"
              onClick={onToggleSidebar}
            >
              <Menu size={16} strokeWidth={2.4} />
            </button>
          </div>

          <div className="ml-auto flex flex-none items-center gap-2">
            <button
              type="button"
              className="gt-button gt-button-secondary inline-flex size-10 items-center justify-center rounded-[18px] gt-text-muted"
              onClick={onRefresh}
              title="Làm mới"
            >
              <CalendarDays size={17} className={loading ? 'animate-spin' : ''} />
            </button>
            {/* <HeaderAccountMenu items={accountMenuItems} displayName={userName} /> */}
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
}: {
  activeSection: AdminSection;
//   accountMenuItems: HeaderAccountMenuItem[];
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
      <header className="sticky top-0 z-40 border-b gt-border bg-[var(--gt-shell)]/95 px-4 py-3 backdrop-blur-xl">
        <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          <button
            type="button"
            aria-label="Đóng hoặc mở sidebar"
            className="gt-button gt-button-secondary inline-flex size-10 shrink-0 items-center justify-center rounded-[18px] gt-text-soft"
            onClick={onToggleSidebar}
          >
            <Menu size={16} strokeWidth={2.4} />
          </button>

          <div className="min-w-0">
            <BrandLogo
              adminDot
              onClick={onBrandClick}
              size="sm"
            />
          </div>

          <div className="ml-auto flex flex-none items-center gap-2">
            <button
              type="button"
            className="gt-button gt-button-secondary inline-flex size-10 items-center justify-center rounded-[18px] gt-text-muted"
              onClick={onRefresh}
              title="Làm mới"
            >
              <CalendarDays size={17} className={loading ? 'animate-spin' : ''} />
            </button>
            {/* <HeaderAccountMenu items={accountMenuItems} triggerLabel={userName} /> */}
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
    <aside aria-label="Điều hướng quản trị" className="flex min-h-0 flex-col gap-4 overflow-hidden border-r gt-border bg-[var(--gt-shell)] px-3 py-3 backdrop-blur-xl">
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
        className="absolute inset-0 bg-[var(--gt-bg)]/70 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside
        aria-label="Điều hướng quản trị"
        className="relative z-10 flex h-full w-[min(88vw,320px)] flex-col border-r gt-border bg-[var(--gt-shell)]/98 px-4 py-4 shadow-[24px_0_56px_rgba(2,6,23,0.4)] backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b gt-border pb-4">
          <BrandLogo
            adminDot
            className="min-w-0 flex-1"
            onClick={() => onNavigate('dashboard')}
            size="lg"
          />

          <button
            type="button"
            aria-label="Đóng sidebar"
          className="gt-button gt-button-secondary inline-flex size-10 shrink-0 items-center justify-center rounded-[18px] gt-text-muted"
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
          'inline-flex size-10 shrink-0 items-center justify-center rounded-[18px] border transition-colors',
          secondary
            ? 'border gt-border bg-[var(--gt-card)] gt-text-muted'
            : active
              ? 'border-[color:var(--gt-border-accent)] bg-[var(--gt-primary-soft)] gt-text'
              : 'border gt-border bg-[var(--gt-card)] gt-text-soft',
        )}
      >
        {icon}
      </span>
      {collapsed ? null : (
        <span className="min-w-0 flex-1 text-left">
          <span className={classNames('block truncate text-sm font-semibold', secondary ? 'gt-text-muted' : active ? 'gt-text' : 'gt-text-soft')}>
            {label}
          </span>
        </span>
      )}
    </>
  );

  const baseClassName = classNames(
    'flex min-h-12 items-center gap-3 rounded-[18px] border px-3 py-2 text-left transition-colors',
    secondary
      ? 'border-transparent bg-transparent gt-text-muted hover:bg-[var(--gt-card)] hover:text-[var(--gt-text-soft)]'
      : active
        ? 'border-[color:var(--gt-border-accent)] bg-[var(--gt-primary-soft)] gt-text shadow-[0_0_0_1px_rgba(34,211,238,0.08)]'
        : 'border-transparent bg-transparent gt-text-soft hover:border-[color:var(--gt-border)] hover:bg-[var(--gt-card)] hover:text-[var(--gt-text)]',
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
      {!collapsed && !secondary ? <ChevronRight size={16} className="ml-auto gt-text-disabled" /> : null}
    </button>
  );
}
