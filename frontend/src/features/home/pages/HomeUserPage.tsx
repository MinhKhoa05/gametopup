import { ArrowRight, Package, Package2, Wallet2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { routes } from "@/app/router/routes";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { GameGrid } from "@/features/games/components/GameGrid";
import { useGamesQuery } from "@/features/games/server";
import { HeroSection } from "@/features/home/components/HeroSection";
import { useRecentOrders } from "@/features/orders/server";
import { useWalletBalanceQuery } from "@/features/wallet/server";
import {
  Button,
  Container,
  EmptyState,
  PanelShell,
  SectionHeading,
  MediaListItem,
  IconBox,
} from "@/shared/components";
import { formatCurrency } from "@/shared/lib/format";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";

export function HomeUserPage() {
  const navigate = useNavigate();
  const auth = useAuthSession();

  const { data: games = [], isLoading: gamesLoading } = useGamesQuery();
  const { data: walletBalance, isLoading: walletLoading } =
    useWalletBalanceQuery();
  const { data: recentOrders = [], isLoading: ordersLoading } =
    useRecentOrders();

  const featuredGames = games.slice(0, 15);

  const userName = auth.user?.displayName ?? "Bạn";

  return (
    <Container className="relative z-10 py-5 sm:py-7 lg:py-8">
      <div className="grid gap-10 lg:gap-12">
        <HeroSection
          eyebrow="TRANG CHỦ"
          title={`Xin chào ${userName} 👋`}
          description="Chọn game yêu thích và tiếp tục hành trình của bạn."
          actions={
            <Button
              variant="primary"
              className="w-fit rounded-[14px] px-5"
              onClick={() => navigate(routes.wallet())}
            >
              Nạp tiền
            </Button>
          }
        />

        <section className="grid gap-6 lg:grid-cols-2">
          <PanelShell className="h-full">
            <div className="flex h-full flex-col justify-between p-6">
              <div className="flex items-start justify-between">
                <div className="grid gap-2">
                  <p className="text-sm gt-text-muted">Số dư ví</p>

                  <h2 className="text-[2.5rem] font-black leading-none gt-text gt-tabular">
                    {walletLoading ? "..." : formatCurrency(walletBalance ?? 0)}
                  </h2>

                  <p className="text-sm gt-text-muted">
                    Sẵn sàng để mua gói game.
                  </p>
                </div>

                <IconBox size="lg" tone="primary">
                  <Wallet2 size={22} />
                </IconBox>
              </div>

              <div className="mt-6">
                <Button
                  variant="primary"
                  className="w-full sm:w-fit"
                  onClick={() => navigate(routes.wallet())}
                >
                  Nạp tiền
                </Button>
              </div>

              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <SectionHeading
                    title="Biến động ví"
                    titleClassName="text-base"
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(routes.wallet())}
                  >
                    Xem tất cả
                  </Button>
                </div>

                {/* Transaction list */}
              </div>
            </div>
          </PanelShell>

          <PanelShell className="h-full">
            <div className="grid h-full gap-5 p-6">
              <div className="flex items-center justify-between">
                <SectionHeading title="Đơn hàng gần đây" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(routes.orders())}
                  trailingIcon={<ArrowRight size={16} />}
                >
                  Xem tất cả
                </Button>
              </div>

              {ordersLoading ? (
                <p className="gt-text-muted">Đang tải...</p>
              ) : recentOrders.length === 0 ? (
                <EmptyState
                  title="Chưa có đơn hàng"
                  description="Hãy chọn một game để bắt đầu."
                />
              ) : (
                <div className="grid gap-3">
                  {recentOrders.map((order) => (
                    <MediaListItem
                      key={order.id}
                      leading={
                        <IconBox size="md" tone="primary">
                          <Package2 size={18} />
                        </IconBox>
                      }
                      title={order.packageName}
                      meta={
                        <time dateTime={order.createdAt}>
                          {new Date(order.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </time>
                      }
                      titleAccessory={
                        <OrderStatusBadge status={order.status} />
                      }
                      onClick={() => navigate(routes.orders())}
                    />
                  ))}
                </div>
              )}
            </div>
          </PanelShell>
        </section>

        <section className="grid gap-6">
          <div className="flex items-center justify-between">
            <SectionHeading title="Chọn game" titleClassName="text-[1.5rem]" />

            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl"
              onClick={() => navigate(routes.games())}
              trailingIcon={<ArrowRight size={16} />}
            >
              Xem tất cả
            </Button>
          </div>

          <GameGrid
            games={featuredGames}
            loading={gamesLoading}
            skeletonCount={10}
            onGameClick={(game) => navigate(routes.gameDetail(game.id))}
          />
        </section>
      </div>
    </Container>
  );
}
