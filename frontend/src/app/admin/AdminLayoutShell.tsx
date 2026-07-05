import { Boxes, ChevronRight, LayoutDashboard, Menu, Users, WalletCards, X } from 'lucide-react';
import { type CSSProperties, type ReactNode } from 'react';
import { BrandLogo } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import type { AdminSection } from '@/app/router/routes';

const ADMIN_NAV_ITEMS: Array<{ icon: ReactNode; label: string; section: AdminSection }> = [
  { section: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Tổng quan' },
  { section: 'games', icon: <Boxes size={18} />, label: 'Quản lý game' },
  { section: 'orders', icon: <WalletCards size={18} />, label: 'Đơn hàng' },
  { section: 'deposits', icon: <WalletCards size={18} />, label: 'Nạp tiền' },
  { section: 'users', icon: <Users size={18} />, label: 'Người dùng' },
];

export function AdminDesktopLayout({
  accountMenu,
  activeSection,
  brandCollapsed,
  children,
  onBrandClick,
  onNavigate,
  onToggleSidebar,
}: {
  accountMenu: ReactNode;
  activeSection: AdminSection;
  brandCollapsed: boolean;
  children: ReactNode;
  onBrandClick: () => void;
  onNavigate: (section: AdminSection) => void;
  onToggleSidebar: () => void;
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
            {accountMenu}
          </div>
        </div>
      </header>

      <AdminSidebarDesktop activeSection={activeSection} collapsed={brandCollapsed} onNavigate={onNavigate} />

      <main className="min-w-0 overflow-auto lg:col-start-2 lg:row-start-2">{children}</main>
    </div>
  );
}

export function AdminMobileLayout({
  accountMenu,
  activeSection,
  children,
  isOpen,
  onBrandClick,
  onCloseSidebar,
  onNavigate,
  onToggleSidebar,
}: {
  accountMenu: ReactNode;
  activeSection: AdminSection;
  children: ReactNode;
  isOpen: boolean;
  onBrandClick: () => void;
  onCloseSidebar: () => void;
  onNavigate: (section: AdminSection) => void;
  onToggleSidebar: () => void;
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
            {accountMenu}
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
}: {
  active?: boolean;
  collapsed?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  const content = (
    <>
      <span
        className={classNames(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-[18px] border transition-colors',
          active
            ? 'border-[color:var(--gt-border-accent)] bg-[var(--gt-primary-soft)] gt-text'
            : 'border gt-border bg-[var(--gt-card)] gt-text-soft',
        )}
      >
        {icon}
      </span>
      {collapsed ? null : (
        <span className="min-w-0 flex-1 text-left">
          <span className={classNames('block truncate text-sm font-semibold', active ? 'gt-text' : 'gt-text-soft')}>
            {label}
          </span>
        </span>
      )}
    </>
  );

  const baseClassName = classNames(
    'flex min-h-12 items-center gap-3 rounded-[18px] border px-3 py-2 text-left transition-colors',
    active
      ? 'border-[color:var(--gt-border-accent)] bg-[var(--gt-primary-soft)] gt-text shadow-[0_0_0_1px_rgba(34,211,238,0.08)]'
      : 'border-transparent bg-transparent gt-text-soft hover:border-[color:var(--gt-border)] hover:bg-[var(--gt-card)] hover:text-[var(--gt-text)]',
    collapsed && 'justify-center px-2',
  );

  return (
    <button type="button" className={baseClassName} onClick={onClick}>
      {content}
      {!collapsed ? <ChevronRight size={16} className="ml-auto gt-text-disabled" /> : null}
    </button>
  );
}
