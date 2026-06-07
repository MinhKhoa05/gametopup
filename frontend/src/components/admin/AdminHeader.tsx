import type { ReactNode } from 'react';
import { ArrowLeft, Boxes, Gamepad2, LayoutDashboard, LogOut, ReceiptText, RefreshCw, ShieldCheck, Users, WalletCards } from 'lucide-react';
import type { Route } from '../../lib/routes';
import { useRoute } from '../../hooks/common/route.hooks';
import { Badge, Button, IconBox, SectionHeading } from '../ui';

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
  deposits: {
    label: 'Nạp tiền',
    description: 'Duyệt hoặc từ chối các yêu cầu nạp tiền đã được khách hàng xác nhận.',
    icon: <WalletCards size={18} />,
  },
  users: {
    label: 'Người dùng',
    description: 'Quản lý người dùng, trạng thái hoạt động và quyền truy cập.',
    icon: <Users size={18} />,
  },
};

export function AdminHeader({
  loading,
  onLogout,
  onRefresh,
  route,
}: {
  loading: boolean;
  onLogout: () => void;
  onRefresh: () => void;
  route: Extract<Route, { name: 'admin' }>;
}) {
  const { navigate } = useRoute();
  const section = route.section ?? 'dashboard';
  const meta = sectionMeta[section];

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 pt-5 sm:px-6 lg:px-8">
      <div className="gt-surface grid gap-5 border-cyan/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeading
            eyebrow="Admin"
            title={
              <span className="inline-flex items-center gap-2">
                <IconBox size="sm" className="h-8 w-8 rounded-xl">
                  {meta.icon}
                </IconBox>
                {meta.label}
              </span>
            }
            description={meta.description}
          />

          <div className="flex flex-wrap items-center gap-2.5">
            <Badge className="gap-2 uppercase tracking-[0.12em]" variant={loading ? 'accent' : 'default'} icon={<ShieldCheck size={14} />}>
              {loading ? 'Đang đồng bộ' : 'Sẵn sàng'}
            </Badge>

            <Button onClick={() => navigate({ name: 'home' })}>
              <ArrowLeft size={16} />
              Về site
            </Button>

            <Button variant={loading ? 'accent' : 'default'} onClick={onRefresh}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </Button>

            <Button
              className="border-rose-400/25 bg-rose-500/10 text-rose-200 hover:border-rose-400/40 hover:bg-rose-500/15 hover:text-white"
              onClick={onLogout}
            >
              <LogOut size={16} />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
