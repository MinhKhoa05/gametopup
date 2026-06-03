import type { ReactNode } from 'react';
import { ArrowLeft, Boxes, Gamepad2, LayoutDashboard, LogOut, ReceiptText, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import type { Route } from '../../lib/routes';
import { classNames } from '../../lib/ui';
import { SectionHeading } from '../common/SectionHeading';

const sectionMeta: Record<
  NonNullable<Extract<Route, { name: 'admin' }>['section']>,
  { description: string; icon: ReactNode; label: string }
> = {
  dashboard: {
    label: 'Tổng quan',
    description: 'Theo dõi doanh thu, đơn hàng và số liệu hệ thống theo thời gian thực.',
    icon: <LayoutDashboard size={18} />,
  },
  games: {
    label: 'Quản lý game',
    description: 'Cập nhật danh sách game, trạng thái hoạt động và thông tin hiển thị.',
    icon: <Gamepad2 size={18} />,
  },
  packages: {
    label: 'Gói nạp',
    description: 'Quản lý các gói nạp theo từng game và kiểm soát trạng thái hiển thị.',
    icon: <Boxes size={18} />,
  },
  orders: {
    label: 'Đơn hàng',
    description: 'Kiểm tra, xử lý và theo dõi các đơn hàng gần đây.',
    icon: <ReceiptText size={18} />,
  },
  users: {
    label: 'Người dùng',
    description: 'Quản lý người dùng, trạng thái hoạt động và quyền truy cập.',
    icon: <Users size={18} />,
  },
};

export function AdminHeader({
  loading,
  navigate,
  onLogout,
  onRefresh,
  route,
}: {
  loading: boolean;
  navigate: (route: Route) => void;
  onLogout: () => void;
  onRefresh: () => void;
  route: Extract<Route, { name: 'admin' }>;
}) {
  const section = route.section ?? 'dashboard';
  const meta = sectionMeta[section];

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 pt-5 sm:px-6 lg:px-8">
      <div className="gametopup-surface grid gap-5 border-cyanline/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeading
            eyebrow="Admin"
            title={
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-cyanline/10 text-cyanline">
                  {meta.icon}
                </span>
                {meta.label}
              </span>
            }
            description={meta.description}
          />

          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={classNames(
                'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em]',
                loading
                  ? 'border-cyanline/20 bg-cyanline/10 text-cyanline'
                  : 'border-white/10 bg-white/5 text-slate-300',
              )}
            >
              <ShieldCheck size={14} />
              {loading ? 'Đang đồng bộ' : 'Sẵn sàng'}
            </span>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-cyanline/30 hover:bg-cyanline/10 hover:text-white"
              onClick={() => navigate({ name: 'home' })}
            >
              <ArrowLeft size={16} />
              Về site
            </button>

            <button
              type="button"
              className={classNames(
                'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition',
                loading
                  ? 'border-cyanline/30 bg-cyanline/10 text-cyanline'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:border-cyanline/30 hover:bg-cyanline/10 hover:text-white',
              )}
              onClick={onRefresh}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm font-bold text-rose-200 transition hover:border-rose-400/40 hover:bg-rose-400/15 hover:text-white"
              onClick={onLogout}
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
