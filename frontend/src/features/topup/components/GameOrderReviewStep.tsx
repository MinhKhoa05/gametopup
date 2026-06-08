import { CreditCard, Layers3, ShoppingCart, Tag, UserRound, WalletCards } from 'lucide-react';
import { ActionCard, Button, EmptyState, IconBox } from '@/components/ui';
import { useRoute } from '@/hooks/common/route.hooks';
import { formatCurrency } from '@/lib/format';
import { classNames, pickImage } from '@/lib/ui';
import { useOrderMutations } from '@/features/orders/api/orders';
import type { Game } from '@/features/games/games.types';
import type { User } from '@/features/user/user.types';
import type { WalletInfo } from '@/features/wallet/wallet.types';
import type { GameOrderSummaryRow } from '@/features/topup/topup.types';
import { useGameOrderStore } from '@/features/topup/store/topup.store';
import { GameOrderStepBanner } from './GameOrderStepBanner';

type Props = {
  game: Game;
  user: User | null;
  wallet: WalletInfo | null;
  walletLoading: boolean;
};

export function GameOrderReviewStep({ game, user, wallet, walletLoading }: Props) {
  const { navigate } = useRoute();
  const checkoutPackage = useGameOrderStore((state) => state.checkoutPackage);
  const checkoutQuantity = useGameOrderStore((state) => state.checkoutQuantity);
  const checkoutGameAccountInfo = useGameOrderStore((state) => state.checkoutGameAccountInfo);
  const setCheckoutSuccess = useGameOrderStore((state) => state.setCheckoutSuccess);
  const orderMutations = useOrderMutations();

  if (!checkoutPackage) {
    return <EmptyState>Vui lòng hoàn tất thông tin bước trước.</EmptyState>;
  }

  const checkoutTotal = checkoutPackage.salePrice * checkoutQuantity;
  const walletBalance = wallet?.balance ?? 0;
  const shortage = Math.max(0, checkoutTotal - walletBalance);
  const orderRows: GameOrderSummaryRow[] = [
    {
      label: 'UID / Server / Tên nhân vật',
      icon: <UserRound size={14} />,
      value: checkoutGameAccountInfo,
    },
    {
      label: 'Số lượng',
      icon: <Layers3 size={14} />,
      value: checkoutQuantity.toString(),
    },
    {
      label: 'Giá gói',
      icon: <Tag size={14} />,
      value: formatCurrency(checkoutPackage.salePrice),
    },
  ];
  const paymentRows: GameOrderSummaryRow[] = [
    {
      label: 'Tạm tính',
      value: formatCurrency(checkoutTotal),
      valueClassName: 'text-white',
    },
    {
      label: 'Giảm giá',
      value: '-0 đ',
      valueClassName: 'text-slate-400',
    },
  ];
  const balanceRows: GameOrderSummaryRow[] = [
    {
      label: 'Số dư hiện tại',
      value: formatCurrency(walletBalance),
      valueClassName: 'text-cyan-50',
    },
    {
      label: 'Cần thanh toán',
      value: formatCurrency(checkoutTotal),
      valueClassName: 'text-amber-300',
    },
    {
      label: 'Thiếu',
      value: formatCurrency(shortage),
      valueClassName: 'text-rose-300',
    },
  ];
  const checkoutActionLabel = walletLoading ? 'Đang tải ví' : shortage > 0 ? 'Thiếu tiền' : 'Thanh toán bằng ví';

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section className="gt-panel grid gap-4 rounded-2xl p-5">
        <GameOrderStepBanner
          afterTitle={
            <p className="m-0 mt-1 text-[0.92rem] font-semibold text-cyan">
              Gói nạp: <span>{checkoutPackage.name}</span>
            </p>
          }
          eyebrow="Bước 2"
          imageAlt={game.name}
          imageSrc={pickImage(game)}
          title="Thanh toán"
        />
        <div className="h-px w-full bg-white/[0.06]" aria-hidden="true" />

        <div className="grid gap-0">
          {orderRows.map((row, index) => (
            <div
              key={row.label}
              className={classNames(
                'grid min-h-[42px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2',
                index < orderRows.length - 1 && 'border-b gt-divider',
              )}
            >
              <span className="inline-flex items-center gap-2 text-[0.79rem] font-medium text-slate-400">
                {row.icon}
                {row.label}
              </span>
              <strong className={classNames('break-words text-right text-[0.96rem] font-semibold', row.valueClassName ?? 'text-white')}>
                {row.value}
              </strong>
            </div>
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
          <Button className="w-full" onClick={() => navigate({ name: 'games', gameId: game.id, step: 1 })}>
            Quay lại
          </Button>
          <Button
            variant="accent"
            className="w-full"
            onClick={async () => {
              if (shortage > 0) return;

              try {
                const orderId = await orderMutations.place.mutateAsync({
                  gamePackageId: checkoutPackage.id,
                  quantity: checkoutQuantity,
                  gameAccountInfo: checkoutGameAccountInfo,
                });

                await orderMutations.pay.mutateAsync({ orderId });
                setCheckoutSuccess(orderId);
                navigate({ name: 'games', gameId: game.id, step: 3 });
              } catch {
                // Toasts are handled by the shared mutation hooks.
              }
            }}
            disabled={orderMutations.place.isPending || orderMutations.pay.isPending || !user || walletLoading || shortage > 0}
          >
            <ShoppingCart size={19} />
            {checkoutActionLabel}
          </Button>
        </div>
      </section>

      <aside className="gt-panel grid gap-4 rounded-2xl p-5">
        <h2 className="m-0 flex items-center gap-2 text-[0.98rem] font-bold text-white">
          <CreditCard size={18} />
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
                  <span>{row.label}</span>
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
          onClick={() => navigate({ name: 'wallet' })}
        />
      </aside>
    </div>
  );
}
