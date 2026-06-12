import { ArrowRight, BadgeCheck, CheckCircle2, Copy, Gift, Gamepad2, WalletCards } from 'lucide-react';
import { Button, EmptyState } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import type { Game, GamePackage } from '@/features/games/types';
import type { TopupCheckoutDraft, TopupCheckoutResult } from '@/features/topup/types';
import { TopupDetailRow, TopupDetailSection, TopupStatusItem } from './TopupLayout';

type TopupSuccessStepProps = {
  checkoutDraft: TopupCheckoutDraft | null;
  checkoutResult: TopupCheckoutResult | null;
  game: Game;
  onCreateNewOrder: () => void;
  packageItem: GamePackage | null;
};

export function TopupSuccessStep({ checkoutDraft, checkoutResult, packageItem, game, onCreateNewOrder }: TopupSuccessStepProps) {
  if (!checkoutDraft || !checkoutResult || !packageItem) {
    return <EmptyState>Không tìm thấy đơn hàng.</EmptyState>;
  }

  const checkoutTotal = packageItem.salePrice * checkoutDraft.quantity;
  const successTime = checkoutResult.successAt
    ? new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(checkoutResult.successAt))
    : '--/--/---- - --:--';
  const orderCode = `#GTU-${String(checkoutResult.orderId).padStart(6, '0')}`;

  const statusCards = [
    {
      badgeClassName: 'bg-emerald-400/10 text-emerald-200',
      badgeLabel: 'Hoàn tất',
      description: successTime,
      icon: <CheckCircle2 size={18} />,
      iconClassName: 'border border-emerald-400/20 bg-emerald-400/12 text-emerald-400',
      title: 'Đã thanh toán',
    },
    {
      badgeClassName: 'bg-cyan/10 text-cyan-50',
      badgeLabel: 'Đang xử lý',
      description: 'Admin sẽ kiểm tra và nạp trong ít phút.',
      hint: 'Ước tính: 1 - 5 phút',
      icon: <span className="text-sm font-black tabular-nums">2</span>,
      title: 'Chờ admin xử lý',
    },
    {
      badgeClassName: 'bg-slate-400/10 text-slate-400',
      badgeLabel: 'Chưa hoàn tất',
      description: 'Sẽ thông báo khi nạp thành công.',
      icon: <span className="text-sm font-black tabular-nums">3</span>,
      iconClassName: 'border gt-divider bg-slate-400/8 text-slate-400',
      iconCircle: true,
      title: 'Hoàn tất',
    },
  ];

  const summaryRows = [
    { icon: <BadgeCheck size={14} />, label: 'Game', value: game.name },
    { icon: <BadgeCheck size={14} />, label: 'Gói nạp', value: packageItem.name },
    { icon: <BadgeCheck size={14} />, label: 'UID / Server / Tên nhân vật', value: checkoutDraft.gameAccountInfo },
    { icon: <BadgeCheck size={14} />, label: 'Số lượng', value: String(checkoutDraft.quantity) },
  ];

  const paymentRows = [
    { icon: <WalletCards size={14} />, label: 'Hình thức', value: 'Ví GameTopUp' },
    { icon: <BadgeCheck size={14} />, label: 'Tạm tính', value: formatCurrency(checkoutTotal) },
  ];

  return (
    <div className="grid gap-4">
      <section className="gt-panel grid min-h-36 grid-cols-1 items-center gap-4 rounded-2xl p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-5">
        <div className="grid place-items-center md:w-[132px]">
          <div className="grid h-20 w-20 place-items-center rounded-2xl border border-emerald-400/20 bg-gradient-to-b from-emerald-400/15 to-emerald-400/5 text-emerald-400 shadow-[0_0_0_10px_rgba(74,222,128,0.06)]">
            <CheckCircle2 size={36} />
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="m-0 mb-1.5 text-[clamp(1.8rem,2.6vw,2.5rem)] font-black leading-[1.04] tracking-[0.01em] text-emerald-400">Đặt hàng thành công!</h1>
          <p className="m-0 mb-1 text-sm font-medium text-slate-200">Đơn hàng của bạn đã được ghi nhận và đang chờ admin xử lý.</p>
          <p className="m-0 text-sm leading-[1.45] text-slate-400">Cảm ơn bạn đã tin tưởng lựa chọn GameTopUp. Chúng tôi sẽ xử lý đơn hàng trong thời gian sớm nhất.</p>
        </div>

        <div className="flex items-center gap-3 md:pr-1" aria-hidden="true">
          <div className="grid place-items-center text-blue-500 drop-shadow-[0_12px_18px_rgba(0,0,0,0.22)]">
            <Gift size={52} />
          </div>
          <div className="grid place-items-center text-sky-400 drop-shadow-[0_12px_18px_rgba(0,0,0,0.22)]">
            <Gamepad2 size={44} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="gt-panel grid gap-4 rounded-2xl p-5">
          <TopupDetailSection title="THÔNG TIN ĐƠN HÀNG" icon={<BadgeCheck size={16} />}>
            <div className="gt-panel-soft grid gap-0 overflow-hidden rounded-xl">
              <TopupDetailRow label="Mã đơn hàng" value={<strong className="justify-self-end text-right text-sm font-semibold text-slate-100">{orderCode}</strong>} icon={<Copy size={14} />} />
              {summaryRows.map((row, index) => (
                <TopupDetailRow
                  key={row.label}
                  label={row.label}
                  value={<strong className="justify-self-end text-right text-sm font-semibold text-white">{row.value}</strong>}
                  icon={row.icon}
                  last={index === summaryRows.length - 1}
                />
              ))}
            </div>
          </TopupDetailSection>

          <TopupDetailSection title="THÔNG TIN THANH TOÁN" icon={<WalletCards size={16} />}>
            <div className="gt-panel-soft grid gap-0 overflow-hidden rounded-xl">
              {paymentRows.map((row) => (
                <TopupDetailRow
                  key={row.label}
                  label={row.label}
                  value={<strong className="justify-self-end text-right text-sm font-semibold text-white">{row.value}</strong>}
                  icon={row.icon}
                />
              ))}
              <TopupDetailRow
                compact
                last
                label="Tổng thanh toán"
                value={<strong className="justify-self-end text-right text-lg font-extrabold text-cyan">{formatCurrency(checkoutTotal)}</strong>}
                icon={<WalletCards size={14} />}
              />
            </div>
          </TopupDetailSection>
        </section>

        <aside className="gt-panel grid gap-3.5 rounded-2xl p-5">
          <div>
            <h2 className="m-0 text-xs font-bold tracking-[0.13em] text-slate-200">TRẠNG THÁI ĐƠN HÀNG</h2>
          </div>

          <div className="grid gap-4">
            {statusCards.map((card) => (
              <TopupStatusItem key={card.title} {...card} />
            ))}
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-cyan/10 bg-cyan/10 px-3.5 py-3 text-sm leading-[1.45] text-cyan-50">
            <BadgeCheck size={15} />
            <span>Admin sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất. Vui lòng không tạo lại đơn giống nhau.</span>
          </div>

          <Button type="button" variant="accent" className="w-full" onClick={onCreateNewOrder}>
            <ArrowRight size={18} />
            Tạo đơn mới
          </Button>
        </aside>
      </div>
    </div>
  );
}
