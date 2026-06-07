import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Gamepad2,
  ShoppingCart,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import { useRoute } from '../../hooks/common/route.hooks';
import { formatCurrency, formatDate } from '../../lib/format';
import { statusLabel } from '../../lib/labels';
import { classNames } from '../../lib/ui';
import type { Game, Order, User } from '../../types';
import type { AdminCatalogMetrics, AdminDepositRequest } from '../../types/admin.type';
import { AdminSkeleton } from './AdminShared';
import { Badge, Button, EmptyState, IconBox, RecordRow, SectionHeading, StatCard } from '../ui';

type DashboardDay = {
  label: string;
  iso: string;
  value: number;
};

export function DashboardPanel({
  depositRequests,
  games,
  loading,
  metrics,
  orders,
  users,
}: {
  depositRequests: AdminDepositRequest[];
  games: Game[];
  loading: boolean;
  metrics: AdminCatalogMetrics;
  orders: Order[];
  users: User[];
}) {
  const { navigate } = useRoute();
  const latestOrders = orders.slice(0, 5);
  const pendingDeposits = depositRequests.slice(0, 3);
  const series = useMemo(() => buildRevenueSeries(orders), [orders]);
  const chartMeta = useMemo(() => buildChartMeta(series), [series]);

  return (
    <div className="grid min-w-0 gap-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Gamepad2 size={18} />}
          iconClassName="border-cyan-400/15 bg-cyan-500/10 text-cyan-100"
          label="Game"
          supporting="100% active"
          value={`${metrics.activeGames} / ${games.length}`}
        />
        <StatCard
          icon={<ShoppingCart size={18} />}
          iconClassName="border-violet-400/15 bg-violet-500/10 text-violet-100"
          label="Đơn hàng"
          supporting="+14% so với tuần trước"
          value={orders.length.toString()}
        />
        <StatCard
          icon={<Clock3 size={18} />}
          iconClassName="border-amber-400/15 bg-amber-500/10 text-amber-100"
          label="Đơn đang chờ"
          supporting="-3% so với tuần trước"
          value={metrics.pendingOrders.toString()}
        />
        <StatCard
          icon={<CircleDollarSign size={18} />}
          iconClassName="border-emerald-400/15 bg-emerald-500/10 text-emerald-100"
          label="Doanh thu"
          supporting="+23% so với tuần trước"
          value={formatCurrency(metrics.paidRevenue)}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.78fr)]">
        <div className="gt-surface overflow-hidden border-white/[0.06] bg-[linear-gradient(180deg,rgba(10,18,34,0.96),rgba(7,13,24,0.98))] shadow-[0_16px_42px_rgba(2,6,23,0.12)]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeading
              title="Doanh thu"
              description="Theo dõi nhịp tăng trưởng trong 7 ngày gần nhất."
            />

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-white/8 bg-white/[0.03] px-3.5 text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                <CalendarDays size={14} />
                7 ngày
              </Button>
              <Badge variant="default" className="rounded-full px-3 py-2 text-[0.8rem]">
                Biểu đồ chính
              </Badge>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <strong className="text-[clamp(1.9rem,3vw,3rem)] font-black leading-[1] tracking-[-0.04em] text-white">
                {formatCurrency(metrics.paidRevenue)}
              </strong>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
                <ArrowUpRight size={16} />
                23% so với 7 ngày trước
              </span>
            </div>

            <RevenueChart series={series} />

            <div className="grid gap-2 sm:grid-cols-3">
              <MetricPill
                accent="emerald"
                icon={<ArrowUpRight size={15} />}
                label="Cao nhất"
                value={formatCurrency(chartMeta.max.value)}
                sublabel={chartMeta.max.label}
              />
              <MetricPill
                accent="rose"
                icon={<ArrowDownRight size={15} />}
                label="Thấp nhất"
                value={formatCurrency(chartMeta.min.value)}
                sublabel={chartMeta.min.label}
              />
              <MetricPill
                accent="blue"
                icon={<TrendingUp size={15} />}
                label="Trung bình"
                value={formatCurrency(chartMeta.average)}
                sublabel="7 ngày gần nhất"
              />
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="gt-surface border-white/[0.06] bg-[linear-gradient(180deg,rgba(10,18,34,0.96),rgba(7,13,24,0.98))] shadow-[0_16px_42px_rgba(2,6,23,0.12)]">
            <div className="flex items-center justify-between gap-3">
              <SectionHeading title="Đơn hàng gần đây" />
              <Button
                className="border-none bg-transparent px-0 text-cyan hover:bg-transparent hover:text-cyan-50"
                onClick={() => navigate({ name: 'admin', section: 'orders' })}
              >
                Xem tất cả
              </Button>
            </div>

            {loading && latestOrders.length === 0 ? (
              <div className="mt-4">
                <AdminSkeleton rows={5} />
              </div>
            ) : latestOrders.length === 0 ? (
              <EmptyState className="mt-4" description="Chưa có đơn hàng nào." />
            ) : (
              <div className="mt-4 grid gap-2.5">
                {latestOrders.map((order) => (
                  <RecordRow className="grid-cols-[auto_minmax(0,1fr)_auto] rounded-[16px] bg-white/[0.025]" key={order.id}>
                    <IconBox size="md" className="border-cyan-400/15 bg-cyan-500/10 text-cyan-100">
                      <ShoppingCart size={17} />
                    </IconBox>
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-bold text-white">#{String(order.id).padStart(4, '0')}</strong>
                      <small className="block truncate text-xs text-slate-400">
                        {formatDate(order.createdAt)} · {order.gameAccountInfo}
                      </small>
                    </div>
                    <div className="grid justify-items-end gap-1">
                      <Badge variant={toneForStatus(order.status)}>{statusLabel(order.status)}</Badge>
                      <b className="text-sm text-white">{formatCurrency(order.total ?? order.unitPrice * order.quantity)}</b>
                    </div>
                  </RecordRow>
                ))}
              </div>
            )}
          </div>

          <div className="gt-surface border-white/[0.06] bg-[linear-gradient(180deg,rgba(10,18,34,0.96),rgba(7,13,24,0.98))] shadow-[0_16px_42px_rgba(2,6,23,0.12)]">
            <div className="flex items-center justify-between gap-3">
              <SectionHeading title="Yêu cầu nạp tiền đang chờ" />
              <Button
                className="border-none bg-transparent px-0 text-cyan hover:bg-transparent hover:text-cyan-50"
                onClick={() => navigate({ name: 'admin', section: 'deposits' })}
              >
                Xem tất cả
              </Button>
            </div>

            {loading && pendingDeposits.length === 0 ? (
              <div className="mt-4">
                <AdminSkeleton rows={3} />
              </div>
            ) : pendingDeposits.length === 0 ? (
              <EmptyState className="mt-4" description="Không có yêu cầu nào đang chờ." />
            ) : (
              <div className="mt-4 grid gap-2.5">
                {pendingDeposits.map((request) => (
                  <RecordRow className="grid-cols-[auto_minmax(0,1fr)_auto] rounded-[16px] bg-white/[0.025]" key={request.id}>
                    <IconBox size="md" className="border-amber-400/15 bg-amber-500/10 text-amber-100">
                      <WalletCards size={17} />
                    </IconBox>
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-bold text-white">#{String(request.id).padStart(4, '0')}</strong>
                      <small className="block truncate text-xs text-slate-400">{formatDate(request.createdAt)}</small>
                    </div>
                    <div className="grid justify-items-end gap-1">
                      <Badge variant="warning">Chờ duyệt</Badge>
                      <b className="text-sm text-white">{formatCurrency(request.amount)}</b>
                    </div>
                  </RecordRow>
                ))}
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="gt-surface border-white/[0.06] bg-[linear-gradient(180deg,rgba(10,18,34,0.96),rgba(7,13,24,0.98))] shadow-[0_16px_42px_rgba(2,6,23,0.12)]">
          <SectionHeading
            title="Thao tác nhanh"
            description="Các lối tắt chính để điều hành hệ thống nhanh hơn."
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickActionButton label="Thêm game" icon={<Gamepad2 size={17} />} onClick={() => navigate({ name: 'admin', section: 'games' })} />
            <QuickActionButton label="Thêm gói nạp" icon={<Boxes size={17} />} onClick={() => navigate({ name: 'admin', section: 'packages' })} />
            <QuickActionButton label="Tạo đơn hàng" icon={<ShoppingCart size={17} />} onClick={() => navigate({ name: 'admin', section: 'orders' })} />
            <QuickActionButton label="Duyệt nạp tiền" icon={<WalletCards size={17} />} onClick={() => navigate({ name: 'admin', section: 'deposits' })} />
          </div>
        </div>

        <div className="gt-surface border-white/[0.06] bg-[linear-gradient(180deg,rgba(10,18,34,0.96),rgba(7,13,24,0.98))] shadow-[0_16px_42px_rgba(2,6,23,0.12)]">
          <SectionHeading
            title="Số liệu hệ thống"
            description="Tổng quan nhanh cho quản trị viên."
          />

          <div className="mt-4 grid gap-2.5">
            <MiniInfoCard
              icon={<Gamepad2 size={17} />}
              label="Game"
              value={`${metrics.activeGames}/${games.length}`}
              sublabel="Đang hoạt động"
            />
            <MiniInfoCard
              icon={<Users size={17} />}
              label="Người dùng"
              value={`${metrics.activeUsers}/${metrics.totalUsers || users.length}`}
              sublabel="Tài khoản hoạt động"
            />
            <MiniInfoCard
              icon={<WalletCards size={17} />}
              label="Gói nạp"
              value={metrics.totalPackages.toString()}
              sublabel={`${metrics.disabledPackages} gói đang tắt`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function RevenueChart({ series }: { series: DashboardDay[] }) {
  const width = 760;
  const height = 284;
  const padding = { top: 18, right: 12, bottom: 34, left: 48 };

  const values = series.map((item) => item.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = Math.max(maxValue - minValue, 1);

  const points = series.map((item, index) => {
    const x = padding.left + (index * (width - padding.left - padding.right)) / Math.max(series.length - 1, 1);
    const y = padding.top + (1 - (item.value - minValue) / range) * (height - padding.top - padding.bottom);

    return { ...item, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPath = `${linePath} L ${lastPoint?.x?.toFixed(2) ?? 0} ${height - padding.bottom} L ${firstPoint?.x?.toFixed(2) ?? 0} ${height - padding.bottom} Z`;

  return (
    <div className="overflow-hidden rounded-[20px] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(6,13,26,0.8),rgba(5,11,22,0.62))] p-3">
      <div className="relative overflow-hidden rounded-[18px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[304px] w-full">
          <defs>
            <linearGradient id="chart-line" x1="0" x2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.28)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.02)" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + ratio * (height - padding.top - padding.bottom);
            const value = maxValue - ratio * range;

            return (
              <g key={ratio}>
                <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 8" />
                <text fill="rgba(148,163,184,0.9)" fontSize="12" x="10" y={y + 4}>
                  {formatCompactCurrency(value)}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#chart-fill)" />
          <path d={linePath} fill="none" stroke="url(#chart-line)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point, index) => (
            <g key={point.iso}>
              <circle cx={point.x} cy={point.y} fill="rgba(12,18,34,1)" r="6.5" stroke="rgba(34,211,238,0.88)" strokeWidth="2.5" />
              {index === points.length - 1 ? (
                <>
                  <circle cx={point.x} cy={point.y} fill="#22d3ee" r="3.5" />
                  <rect
                    fill="rgba(15,23,42,0.94)"
                    height="54"
                    rx="14"
                    stroke="rgba(255,255,255,0.08)"
                    width="138"
                    x={Math.max(point.x - 68, padding.left)}
                    y={Math.max(point.y - 80, 8)}
                  />
                  <text fill="#cbd5e1" fontSize="12" x={Math.max(point.x - 54, padding.left + 14)} y={Math.max(point.y - 54, 32)}>
                    {point.label}
                  </text>
                  <text fill="#f8fafc" fontSize="14" fontWeight="700" x={Math.max(point.x - 54, padding.left + 14)} y={Math.max(point.y - 30, 56)}>
                    {formatCurrency(point.value)}
                  </text>
                </>
              ) : null}
            </g>
          ))}

          {points.map((point, index) => (
            <text key={`${point.iso}-label`} fill="rgba(148,163,184,0.95)" fontSize="12" textAnchor="middle" x={point.x} y={height - 12}>
              {index === 0 || index === points.length - 1 || index % 2 === 0 ? point.label : ''}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function MetricPill({
  accent,
  icon,
  label,
  sublabel,
  value,
}: {
  accent: 'blue' | 'emerald' | 'rose';
  icon: ReactNode;
  label: string;
  sublabel: string;
  value: string;
}) {
  const accentClass =
    accent === 'emerald'
      ? 'border-emerald-400/15 bg-emerald-500/10 text-emerald-100'
      : accent === 'rose'
        ? 'border-rose-400/15 bg-rose-500/10 text-rose-100'
        : 'border-cyan-400/15 bg-cyan-500/10 text-cyan-100';

  return (
    <div className="rounded-[16px] border border-white/[0.05] bg-white/[0.025] p-3">
      <div className="flex items-start gap-3">
        <IconBox size="sm" className={classNames('h-9 w-9 rounded-xl border-0', accentClass)}>
          {icon}
        </IconBox>
        <div className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
          <strong className="block text-base font-black text-white">{value}</strong>
          <span className="block text-xs text-slate-400">{sublabel}</span>
        </div>
      </div>
    </div>
  );
}

function MiniInfoCard({
  icon,
  label,
  sublabel,
  value,
}: {
  icon: ReactNode;
  label: string;
  sublabel: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[16px] border border-white/[0.05] bg-white/[0.025] px-3 py-3">
      <div className="flex items-center gap-3">
        <IconBox size="sm" className="h-9 w-9 rounded-xl border-0 bg-white/[0.04] text-cyan-50">
          {icon}
        </IconBox>
        <div className="min-w-0">
          <strong className="block text-sm font-bold text-white">{label}</strong>
          <span className="block text-xs text-slate-400">{sublabel}</span>
        </div>
      </div>
      <strong className="text-lg font-black text-white">{value}</strong>
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button className="justify-between rounded-[16px] border-white/[0.05] bg-white/[0.025] px-3.5 py-3 text-left text-slate-100 hover:border-cyan/20 hover:bg-cyan/10 hover:text-white" onClick={onClick}>
      <span className="inline-flex items-center gap-3">
        <IconBox size="sm" className="h-9 w-9 rounded-xl border-0 bg-white/[0.05] text-cyan-50">
          {icon}
        </IconBox>
        <span className="text-sm font-semibold">{label}</span>
      </span>
      <ChevronRight size={16} className="text-slate-500" />
    </Button>
  );
}

function buildRevenueSeries(orders: Order[]) {
  const days = buildLastDays(7);
  const valuesByDay = new Map<string, number>();

  for (const day of days) {
    valuesByDay.set(day.iso, 0);
  }

  for (const order of orders) {
    if (order.status === 5) {
      continue;
    }

    const iso = toLocalIsoDate(order.createdAt);
    if (!valuesByDay.has(iso)) {
      continue;
    }

    valuesByDay.set(iso, (valuesByDay.get(iso) ?? 0) + (order.total ?? order.unitPrice * order.quantity));
  }

  return days.map((day) => ({
    ...day,
    value: valuesByDay.get(day.iso) ?? 0,
  }));
}

function buildChartMeta(series: DashboardDay[]) {
  const values = series.map((item) => item.value);
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

  const max = series.reduce(
    (current, item) => (item.value >= current.value ? item : current),
    series[0] ?? { iso: '', label: '--', value: 0 },
  );
  const min = series.reduce(
    (current, item) => (item.value <= current.value ? item : current),
    series[0] ?? { iso: '', label: '--', value: 0 },
  );

  return { average, max, min };
}

function buildLastDays(length: number) {
  const result: Array<{ iso: string; label: string }> = [];
  const now = new Date();

  for (let offset = length - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    result.push({
      iso: toLocalIsoDate(date.toISOString()),
      label: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date),
    });
  }

  return result;
}

function toLocalIsoDate(value: string) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatCompactCurrency(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }

  return `${Math.round(value)}`;
}

function toneForStatus(status: number) {
  switch (status) {
    case 1:
      return 'warning';
    case 2:
      return 'accent';
    case 3:
      return 'default';
    case 4:
      return 'success';
    case 5:
      return 'danger';
    default:
      return 'default';
  }
}
