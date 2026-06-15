import { ArrowUpRight, Clock3, ReceiptText, WalletCards } from 'lucide-react';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { WalletDepositDialog } from '@/features/wallet/components/WalletDepositDialog';
import { WalletHistoryPanel } from '@/features/wallet/components/WalletHistoryPanel';
import { useWalletPage } from '@/features/wallet/hooks/useWalletPage';
import { EmptyState, IconBox, PageHero, StatCard } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';

export function WalletPage() {
  const {
    auth,
    bankOptions,
    currentHistoryPage,
    historyFilters,
    historyPageRows,
    historyTotalPages,
    historyView,
    isDepositOpen,
    navigateToLogin,
    setHistoryFilters,
    setHistoryPage,
    setHistoryView,
    setIsDepositOpen,
    stats,
  } = useWalletPage();

  if (auth.status === 'checking' && !auth.user) {
    return <WalletLoadingState />;
  }

  if (!auth.user) {
    return (
      <EmptyState
        className="mx-auto mt-12 max-w-lg"
        icon={<WalletCards size={24} />}
        iconSize="lg"
        iconTone="neutral"
        title="Bạn chưa đăng nhập"
        description="Vui lòng đăng nhập để quản lý ví và tạo yêu cầu nạp tiền."
        actionLabel="Đăng nhập ngay"
        onAction={navigateToLogin}
      />
    );
  }

  return (
    <div className="relative isolate overflow-hidden">
      <AppPageContainer className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-6 lg:gap-7">
          <PageHero
            eyebrow="QUẢN LÝ TÀI KHOẢN"
            visual={
              <IconBox size="lg" tone="primary" className="h-[62px] w-[62px] shrink-0 rounded-[18px]">
                <WalletCards size={30} strokeWidth={1.8} />
              </IconBox>
            }
            title="Nạp tiền vào ví"
            description="Nhập số tiền cần nạp, hệ thống sẽ tự động tạo mã QR kèm nội dung chuyển khoản chính xác."
          />

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,0.95fr)] xl:items-stretch">
            <aside className="relative overflow-hidden rounded-[30px] border border-cyan-300/14 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.2),transparent_26%),linear-gradient(165deg,rgba(8,16,31,0.99),rgba(7,12,24,0.99))] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.22)] sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.08),transparent_20%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_40%,rgba(255,255,255,0.03))] opacity-70" />

              <div className="relative flex min-h-[320px] flex-col gap-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid gap-1">
                    <p className="m-0 text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-100/80">VÍ NỘI BỘ GAMETOPUP</p>
                  </div>

                  <div className="grid size-12 place-items-center rounded-[18px] border border-cyan-300/18 bg-cyan-400/12 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <WalletCards size={20} />
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4 border-t border-white/[0.08] pt-4">
                  <div className="grid gap-1">
                    <span className="text-[0.74rem] font-black uppercase tracking-[0.22em] text-slate-500">Số dư</span>
                    <strong className="text-[clamp(2.2rem,3.9vw,4rem)] font-black tracking-[-0.08em] text-white gt-tabular">
                      {formatCurrency(stats.balance)}
                    </strong>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <button
                    type="button"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-[16px] bg-cyan-400 px-4 text-sm font-black text-slate-950 transition-all duration-200 hover:-translate-y-px hover:bg-cyan-300"
                    onClick={() => setIsDepositOpen(true)}
                  >
                    Nạp tiền
                  </button>
                </div>
              </div>
            </aside>

            <div className="grid gap-3 self-stretch">
              <StatCard
                compact
                icon={<ArrowUpRight size={20} />}
                label="Tổng đã nạp"
                tone="success"
                value={formatCurrency(stats.topupAmount)}
              />
              <StatCard
                compact
                icon={<Clock3 size={20} />}
                label="Yêu cầu nạp"
                tone="warning"
                value={`${stats.requests} yêu cầu`}
              />
              <StatCard
                compact
                icon={<ReceiptText size={20} />}
                label="Giao dịch gần đây"
                tone="primary"
                value={`${stats.transactions} giao dịch`}
              />
            </div>
          </section>

          <WalletHistoryPanel
            bankOptions={bankOptions}
            currentPage={currentHistoryPage}
            filters={historyFilters}
            mode={historyView}
            onChange={(patch) => setHistoryFilters((current) => ({ ...current, ...patch }))}
            onPageChange={setHistoryPage}
            onViewChange={setHistoryView}
            rows={historyPageRows}
            totalPages={historyTotalPages}
          />
        </div>
      </AppPageContainer>
      <WalletDepositDialog
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onViewHistory={() => {
          setHistoryView('deposit');
          setIsDepositOpen(false);
        }}
      />
    </div>
  );
}

function WalletLoadingState() {
  return (
    <AppPageContainer className="py-5 sm:py-7 lg:py-8" aria-busy="true">
      <div className="grid gap-6 lg:gap-7">
        <div className="h-[380px] animate-pulse rounded-[30px] border border-white/10 bg-white/[0.03]" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[116px] animate-pulse rounded-[22px] border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-[480px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
          <div className="h-[480px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
        </div>
        <div className="h-[260px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
      </div>
    </AppPageContainer>
  );
}
