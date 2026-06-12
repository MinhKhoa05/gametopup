import { ShoppingCart, WalletCards } from 'lucide-react';
import { ActionCard, Button, EmptyState, IconBox } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { Game, GamePackage } from '@/features/games/types';
import { TopupDetailRow, TopupHeroBanner } from './TopupLayout';

type TopupReviewStepProps = {
  busy: boolean;
  game: Game;
  gameAccountInfo: string;
  onAddFunds: () => void;
  onBack: () => void;
  onConfirm: () => void;
  packageItem: GamePackage | null;
  quantity: number;
  isAuthenticated: boolean;
  walletBalance: number;
  walletLoading: boolean;
};

export function TopupReviewStep({
  busy,
  game,
  gameAccountInfo,
  onAddFunds,
  onBack,
  onConfirm,
  packageItem,
  quantity,
  isAuthenticated,
  walletBalance,
  walletLoading,
}: TopupReviewStepProps) {
  if (!packageItem) {
    return <EmptyState>Vui lòng hoàn tất thông tin bước trước.</EmptyState>;
  }

  const checkoutTotal = packageItem.salePrice * quantity;
  const shortage = Math.max(0, checkoutTotal - walletBalance);
  const checkoutActionLabel = walletLoading ? 'Đang tải ví' : shortage > 0 ? 'Thiếu tiền' : 'Thanh toán bằng ví';
  const walletBalanceLabel = walletLoading ? 'Đang tải...' : formatCurrency(walletBalance);
  const orderRows = [
    { icon: <span className="text-sm font-black tabular-nums">1</span>, label: 'UID / Server / Tên nhân vật', value: gameAccountInfo },
    { icon: <span className="text-sm font-black tabular-nums">2</span>, label: 'Số lượng', value: String(quantity) },
    { icon: <span className="text-sm font-black tabular-nums">3</span>, label: 'Giá gói', value: formatCurrency(packageItem.salePrice) },
  ];
  const paymentRows = [
    { label: 'Tạm tính', value: formatCurrency(checkoutTotal), valueClassName: 'text-white' },
  ];
  const balanceRows = [
    { label: 'Số dư hiện tại', value: walletBalanceLabel, valueClassName: walletLoading ? 'text-slate-400' : 'text-cyan-50' },
    { label: 'Cần thanh toán', value: formatCurrency(checkoutTotal), valueClassName: 'text-amber-300' },
    { label: 'Thiếu', value: walletLoading ? 'Đang tải...' : formatCurrency(shortage), valueClassName: walletLoading ? 'text-slate-400' : 'text-rose-300' },
  ];

  return (
    <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section className="gt-panel grid gap-4 rounded-2xl p-5">
        <TopupHeroBanner
          afterTitle={
            <p className="m-0 text-[0.92rem] font-semibold text-cyan">
              Gói nạp: <span>{packageItem.name}</span>
            </p>
          }
          eyebrow="Bước 2"
          imageAlt={game.name}
          imageSrc={game.imageUrl}
          title="Thanh toán"
        />
        <div className="h-px w-full bg-white/[0.06]" aria-hidden="true" />

        <div className="grid gap-0">
          {orderRows.map((row, index) => (
            <TopupDetailRow
              key={row.label}
              icon={row.icon}
              label={row.label}
              value={<strong className="break-words text-right text-[0.96rem] font-semibold text-white">{row.value}</strong>}
              last={index === orderRows.length - 1}
            />
          ))}
        </div>

        <div className="h-px w-full bg-white/[0.06]" aria-hidden="true" />

        <div className="grid gap-0">
          {paymentRows.map((row) => (
            <div key={row.label} className="flex justify-between gap-3 border-b gt-divider py-2.5 text-sm text-slate-400">
              <span>{row.label}</span>
              <strong className={classNames('text-right font-bold', row.valueClassName)}>{row.value}</strong>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 py-2.5 text-sm font-bold text-white">
            <span>Tổng thanh toán</span>
            <strong className="text-right text-[1.08rem] font-extrabold text-cyan">{formatCurrency(checkoutTotal)}</strong>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="w-full" onClick={onBack} disabled={busy}>
            Quay lại
          </Button>
          <Button variant="accent" className="w-full" onClick={onConfirm} disabled={busy || !isAuthenticated || walletLoading || shortage > 0}>
            <ShoppingCart size={19} />
            {checkoutActionLabel}
          </Button>
        </div>
      </section>

      <aside className="gt-panel grid gap-4 rounded-2xl p-5">
        <h2 className="m-0 flex items-center gap-2 text-[0.98rem] font-bold text-white">
          <WalletCards size={18} />
          Chọn hình thức thanh toán
        </h2>

        <div className="gt-panel grid grid-cols-[auto_minmax(0,1fr)] gap-3.5 rounded-2xl p-3.5">
          <IconBox size="lg">
            <WalletCards size={28} />
          </IconBox>
          <div className="grid gap-2">
            <p className="m-0 text-[0.92rem] font-bold text-slate-200">Số dư ví của bạn</p>
            <div className="grid gap-0">
              {balanceRows.map((row) => (
                <div key={row.label} className="flex min-h-9 items-center justify-between gap-3 py-1.5">
                  <span className="text-slate-400">{row.label}</span>
                  <strong className={classNames('text-right text-[1rem] font-bold', row.valueClassName)}>{row.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" aria-hidden="true" />

        <ActionCard
          className="p-4"
          icon={
            <IconBox size="sm" circle>
              <WalletCards size={18} />
            </IconBox>
          }
          title="Nạp thêm tiền vào ví"
          description="Nạp tiền để thanh toán đơn hàng này."
          onClick={onAddFunds}
        />
      </aside>
    </div>
  );
}
