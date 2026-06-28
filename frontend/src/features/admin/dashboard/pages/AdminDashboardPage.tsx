import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  Gamepad2,
  LayoutDashboard,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { routes } from "@/app/router/routes";
import type { User } from "@/features/auth/types";
import type { AdminGamePackage } from "@/features/packages/types";
import type { AdminGame } from "@/features/games/types";
import type { AdminDepositRequest } from "@/features/deposits/types";
import type { AdminOrder } from "@/features/orders/types";
import { useAdminGamesQuery } from "@/features/games/server";
import { useAdminPackagesQuery } from "@/features/packages/server";
import { useAdminOrdersSection } from "@/features/orders/admin/hooks";
import { useAdminDepositRequestsSection } from "@/features/deposits/admin/hooks";
import { useAdminUsersQuery } from "@/features/users/server";
import {
  buildQueueItems,
  buildRecentUsers,
  buildWatchItems,
  countOrdersToday,
} from "@/features/admin/dashboard/model";
import {
  Badge,
  Button,
  DetailRow,
  EmptyState,
  FilterChipGroup,
  IconBox,
  ImageBox,
  MediaListItem,
  PageHero,
  PanelShell,
  SearchBar,
  SectionHeading,
  StatCard,
} from "@/shared/components";
import { classNames } from "@/shared/lib/classNames";
import { formatCurrency, formatDate } from "@/shared/lib/format";

export function AdminDashboardPage() {
  const gamesQuery = useAdminGamesQuery();
  const games = gamesQuery.data ?? [];
  const firstGameId = games[0]?.id ?? 0;
  const packagesQuery = useAdminPackagesQuery(firstGameId);
  const ordersSection = useAdminOrdersSection();
  const depositsSection = useAdminDepositRequestsSection();
  const usersQuery = useAdminUsersQuery();

  const packages = packagesQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const loading =
    (gamesQuery.isPending && gamesQuery.data === undefined) ||
    (packagesQuery.isPending && packagesQuery.data === undefined) ||
    ordersSection.loading ||
    depositsSection.loading ||
    (usersQuery.isPending && usersQuery.data === undefined);
  const metrics = {
    activeGames: games.filter((game) => game.isActive).length,
    activeUsers: users.filter((user) => user.isActive !== false).length,
    disabledPackages: packages.filter((item) => !item.isActive).length,
    pendingOrders: ordersSection.orders.filter((order) => order.status === 1 || order.status === 2).length,
    revenue: ordersSection.orders.filter((order) => order.status !== 4).reduce((sum, order) => sum + order.packagePrice, 0),
    totalPackages: packages.length,
    totalUsers: users.length,
  };

  return (
    <DashboardPanel
      depositRequests={depositsSection.requests}
      games={games}
      loading={loading}
      metrics={metrics}
      orders={ordersSection.orders}
      packages={packages}
      users={users}
    />
  );
}

type AdminCatalogMetrics = {
  activeGames: number;
  activeUsers: number;
  disabledPackages: number;
  revenue: number;
  pendingOrders: number;
  totalPackages: number;
  totalUsers: number;
};

type DashboardScope = "all" | "orders" | "deposits";

export function DashboardPanel({
  depositRequests,
  games,
  loading,
  metrics,
  orders,
  packages,
  users,
}: {
  depositRequests: AdminDepositRequest[];
  games: AdminGame[];
  loading: boolean;
  metrics: AdminCatalogMetrics;
  orders: AdminOrder[];
  packages: AdminGamePackage[];
  users: User[];
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<DashboardScope>("all");

  const watchItems = useMemo(
    () => buildWatchItems(packages, games),
    [games, packages],
  );
  const recentUsers = useMemo(() => buildRecentUsers(users), [users]);
  const todayOrdersCount = useMemo(() => countOrdersToday(orders), [orders]);

  const systemRows = [
    { label: "Người dùng hoạt động", value: metrics.activeUsers.toString() },
    { label: "Gói nạp", value: metrics.totalPackages.toString() },
    { label: "Gói đang tắt", value: metrics.disabledPackages.toString() },
    {
      label: "Nạp tiền chờ duyệt",
      value: depositRequests
        .filter((request) => request.status === 1 || request.status === 2)
        .length.toString(),
    },
  ];

  return (
    <div className="grid min-w-0 gap-10 lg:gap-12">
      <PageHero
        eyebrow="ADMIN"
        visual={
          <DashboardHeroVisual
            metrics={metrics}
            depositCount={depositRequests.length}
            todayOrdersCount={todayOrdersCount}
          />
        }
        title="Điều hành hệ thống"
        description="Theo dõi đơn hàng, kiểm tra nạp tiền và giữ kho game luôn ở trạng thái sẵn sàng trong cùng một màn hình."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Gamepad2 size={18} />}
          label="Game hoạt động"
          supporting="Danh mục đang mở bán"
          tone="primary"
          value={`${metrics.activeGames} / ${games.length}`}
        />
        <StatCard
          icon={<ShoppingCart size={18} />}
          label="Đơn hôm nay"
          supporting="Đơn tạo mới trong ngày"
          tone="success"
          value={todayOrdersCount.toString()}
        />
        <StatCard
          icon={<Clock3 size={18} />}
          label="Đơn chờ xử lý"
          supporting="Cần thao tác ngay"
          tone="warning"
          value={metrics.pendingOrders.toString()}
        />
        <StatCard
          icon={<CircleDollarSign size={18} />}
          label="Doanh thu"
          supporting="Tổng ghi nhận hệ thống"
          tone="primary"
          value={formatCurrency(metrics.revenue)}
        />
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.58fr)_minmax(320px,0.82fr)]">
        <PanelShell className="overflow-hidden">
          <div className="px-5 pt-5 sm:px-6 sm:pt-6">
            <SectionHeading
              className="items-center"
              title="Hàng đợi xử lý"
              titleClassName="text-[1.35rem]"
              description="Đơn hàng và yêu cầu nạp tiền mới nhất."
              action={
                <Badge
                  tone={loading ? "primary" : "success"}
                  icon={<LayoutDashboard size={14} />}
                  className="rounded-full px-3.5 py-2"
                >
                  {loading ? "Đang tải" : "Sẵn sàng"}
                </Badge>
              }
            />
          </div>

          <div className="grid gap-4 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Tìm đơn, mã nạp, tên game..."
              ariaLabel="Tìm kiếm hàng đợi"
              dense
            />

            <FilterChipGroup
              items={[
                { value: "all", label: "Tất cả" },
                { value: "orders", label: "Đơn hàng" },
                { value: "deposits", label: "Nạp tiền" },
              ]}
              value={scope}
              onChange={(value) => setScope(value as DashboardScope)}
            />
          </div>
        </PanelShell>

        <div className="grid gap-8">
          <PanelShell>
            <div className="px-5 pt-5 sm:px-6 sm:pt-6">
              <SectionHeading
                title="Tóm tắt vận hành"
                titleClassName="text-[1.25rem]"
                description="Những chỉ số quan trọng cần nhìn nhanh."
              />
            </div>

            <div className="grid gap-2 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              {systemRows.map((row) => (
                <DetailRow key={row.label} label={row.label}>
                  {row.value}
                </DetailRow>
              ))}

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <Button
                  variant="primary"
                  className="justify-center rounded-[16px] px-4"
                  onClick={() => navigate(routes.admin("orders"))}
                >
                  Mở đơn hàng
                  <ArrowRight size={16} />
                </Button>
                <Button
                  variant="outline"
                  className="justify-center rounded-[16px] px-4"
                  onClick={() => navigate(routes.admin("deposits"))}
                >
                  Duyệt nạp tiền
                </Button>
              </div>
            </div>
          </PanelShell>

          <PanelShell>
            <div className="px-5 pt-5 sm:px-6 sm:pt-6">
              <SectionHeading
                title="Kho cần chú ý"
                titleClassName="text-[1.25rem]"
                description="Gói nạp có tồn thấp hoặc đang tắt."
                action={
                  <Button
                    variant="ghost"
                    className="px-0 text-cyan"
                    onClick={() => navigate(routes.admin("packages"))}
                  >
                    Xem kho
                  </Button>
                }
              />
            </div>

            <div className="grid gap-3 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              {watchItems.length ? (
                watchItems.map((item) => (
                  <MediaListItem
                    key={item.id}
                    onClick={() => navigate(item.actionHref)}
                    leading={
                      <ImageBox
                        src={item.imageUrl}
                        alt={item.title}
                        className="object-cover"
                      />
                    }
                    title={item.title}
                    subtitle={item.subtitle}
                    meta={item.description}
                    titleAccessory={
                      <Badge tone={item.tone} className="rounded-full">
                        {item.stockLabel}
                      </Badge>
                    }
                    trailing={
                      <span className="text-xs text-slate-500">Mở kho</span>
                    }
                  />
                ))
              ) : (
                <EmptyState
                  title="Kho đang ổn"
                  description="Không có gói nào cần kiểm tra gấp vào lúc này."
                />
              )}
            </div>
          </PanelShell>

          <PanelShell>
            <div className="px-5 pt-5 sm:px-6 sm:pt-6">
              <SectionHeading
                title="Người dùng gần đây"
                titleClassName="text-[1.25rem]"
                description="Tài khoản mới nhất trong hệ thống."
                action={
                  <Badge tone="neutral" className="rounded-full px-3.5 py-2">
                    {recentUsers.length} tài khoản
                  </Badge>
                }
              />
            </div>

            <div className="grid gap-3 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              {recentUsers.length ? (
                recentUsers.map((user) => {
                  const roleLabel = user.role?.toString();

                  return (
                    <MediaListItem
                      key={user.id}
                      leading={
                        <IconBox
                          size="md"
                          tone="neutral"
                          className="h-12 w-12 rounded-[18px]"
                        >
                          <UserRound size={18} />
                        </IconBox>
                      }
                      title={user.displayName}
                      subtitle={user.email}
                      meta={formatDate(user.createdAt)}
                      titleAccessory={
                        <Badge
                          tone={user.isActive !== false ? "success" : "neutral"}
                          className="rounded-full"
                        >
                          {user.isActive !== false ? "Hoạt động" : "Ngưng"}
                        </Badge>
                      }
                      trailing={
                        <Badge
                          tone={roleLabel === "Member" ? "neutral" : "primary"}
                          className="rounded-full"
                        >
                          {roleLabel}
                        </Badge>
                      }
                    />
                  );
                })
              ) : (
                <EmptyState
                  title="Chưa có dữ liệu"
                  description="Danh sách người dùng sẽ xuất hiện ở đây khi hệ thống đã có tài khoản."
                />
              )}
            </div>
          </PanelShell>
        </div>
      </section>
    </div>
  );
}

function DashboardHeroVisual({
  metrics,
  depositCount,
  todayOrdersCount,
}: {
  metrics: AdminCatalogMetrics;
  depositCount: number;
  todayOrdersCount: number;
}) {
  const bars = [58, 74, 66, 86, 64];

  return (
    <div className="relative w-full max-w-[320px]">
      <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="gt-panel relative grid gap-3 rounded-[26px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1">
            <p className="m-0 text-[0.68rem] font-black uppercase tracking-[0.22em] text-cyan-100/80">
              Live control
            </p>
            <strong className="text-sm font-bold text-white">
              Tình trạng hệ thống
            </strong>
          </div>
          <IconBox size="sm" tone="primary" className="rounded-[18px]">
            <LayoutDashboard size={16} />
          </IconBox>
        </div>

        <div className="grid gap-2">
          <MiniPulse
            label="Đơn chờ"
            value={metrics.pendingOrders.toString()}
            tone="warning"
          />
          <MiniPulse
            label="Nạp chờ"
            value={depositCount.toString()}
            tone="primary"
          />
          <MiniPulse
            label="Đơn hôm nay"
            value={todayOrdersCount.toString()}
            tone="success"
          />
        </div>

        <div className="gt-card rounded-[18px] p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold gt-text-muted">
              Nhịp giao dịch
            </span>
            <span className="text-xs font-semibold text-cyan-100">
              7 ngày gần nhất
            </span>
          </div>
          <div className="mt-3 flex items-end gap-1.5">
            {bars.map((height, index) => (
              <span
                key={height}
                className={classNames(
                  "h-20 flex-1 rounded-t-[10px]",
                  index === bars.length - 1 ? "bg-cyan-400" : "bg-cyan-400/40",
                )}
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniPulse({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "primary" | "success" | "warning";
  value: string;
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-400/15 bg-emerald-500/10 text-emerald-100"
      : tone === "warning"
        ? "border-amber-400/15 bg-amber-500/10 text-amber-100"
        : "border-cyan-400/15 bg-cyan-500/10 text-cyan-100";

  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/[0.06] bg-[var(--gt-card)] px-3 py-3">
      <div className="flex items-center gap-3">
        <span
          className={classNames(
            "inline-flex size-9 items-center justify-center rounded-[18px] border text-sm font-black",
            toneClass,
          )}
        >
          {label.slice(0, 1)}
        </span>
        <div className="grid gap-0.5">
          <strong className="text-sm font-bold gt-text">{label}</strong>
          <span className="text-xs gt-text-muted">Theo dõi trực tiếp</span>
        </div>
      </div>
      <strong className="text-lg font-black tracking-[-0.04em] gt-text">
        {value}
      </strong>
    </div>
  );
}
