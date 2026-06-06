import { ArrowRight, BadgeCheck, CheckCircle2, Clock3, Copy, Gift, Gamepad2, Layers3, PackageCheck, UserRound, WalletCards } from 'lucide-react';
import { Button, EmptyState, IconBox } from '../ui';
import { useRoute } from '../../hooks/common/route.hooks';
import { formatCurrency } from '../../lib/format';
import { classNames } from '../../lib/ui';
import { useGameOrderStore } from '../../store/game-order.store';
import type { OrderDetailField, OrderStatusCard } from '../../types/game-order-ui.type';

export function GameOrderSuccessStep() {
  const { navigate } = useRoute();
  const checkoutPackage = useGameOrderStore((state) => state.checkoutPackage);
  const checkoutGameName = useGameOrderStore((state) => state.checkoutGameName);
  const checkoutOrderId = useGameOrderStore((state) => state.checkoutOrderId);
  const checkoutSuccessAt = useGameOrderStore((state) => state.checkoutSuccessAt);
  const checkoutGameAccountInfo = useGameOrderStore((state) => state.checkoutGameAccountInfo);
  const checkoutQuantity = useGameOrderStore((state) => state.checkoutQuantity);
  const activeGameId = useGameOrderStore((state) => state.activeGameId);
  const resetWizard = useGameOrderStore((state) => state.resetWizard);

  if (!checkoutPackage || !checkoutOrderId || !checkoutGameName) {
    return <EmptyState>Không tìm thấy đơn hàng.</EmptyState>;
  }

  const checkoutTotal = checkoutPackage.salePrice * checkoutQuantity;
  const orderCode = `#GTU-${String(checkoutOrderId).padStart(6, '0')}`;
  const successTime = checkoutSuccessAt
    ? new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(checkoutSuccessAt))
    : '--/--/---- - --:--';
  const orderInfoFields: OrderDetailField[] = [
    {
      icon: <Copy size={14} />,
      label: 'Mã đơn hàng',
      value: <strong className="justify-self-end text-right text-sm font-semibold text-slate-100">{orderCode}</strong>,
    },
    {
      icon: <BadgeCheck size={14} />,
      label: 'Game',
      value: <strong className="justify-self-end text-right text-sm font-semibold text-white">{checkoutGameName}</strong>,
    },
    {
      icon: <PackageCheck size={14} />,
      label: 'Gói nạp',
      value: <strong className="justify-self-end text-right text-sm font-semibold text-white">{checkoutPackage.name}</strong>,
    },
    {
      icon: <UserRound size={14} />,
      label: 'UID / Server / Tên nhân vật',
      value: <strong className="justify-self-end text-right text-sm font-semibold text-white">{checkoutGameAccountInfo}</strong>,
    },
    {
      icon: <Layers3 size={14} />,
      label: 'Số lượng',
      last: true,
      value: <strong className="justify-self-end text-right text-sm font-semibold text-white">{checkoutQuantity}</strong>,
    },
  ];
  const paymentInfoFields: OrderDetailField[] = [
    {
      icon: <WalletCards size={14} />,
      label: 'Hình thức',
      value: <strong className="justify-self-end text-right text-sm font-semibold text-white">Ví GameTopUp</strong>,
    },
    {
      icon: <Layers3 size={14} />,
      label: 'Tạm tính',
      value: <strong className="justify-self-end text-right text-sm font-semibold text-white">{formatCurrency(checkoutTotal)}</strong>,
    },
    {
      icon: <BadgeCheck size={14} />,
      label: 'Giảm giá',
      value: <strong className="justify-self-end text-right text-sm font-semibold text-slate-400">-0 đ</strong>,
    },
    {
      compact: true,
      label: 'Tổng thanh toán',
      value: <strong className="justify-self-end text-right text-lg font-extrabold text-cyan">{formatCurrency(checkoutTotal)}</strong>,
    },
  ];
  const statusCards: OrderStatusCard[] = [
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
      icon: <Clock3 size={18} />,
      title: 'Chờ admin xử lý',
    },
    {
      badgeClassName: 'bg-slate-400/10 text-slate-400',
      badgeLabel: 'Chưa hoàn tất',
      description: 'Sẽ thông báo khi nạp thành công.',
      icon: <PackageCheck size={18} />,
      iconClassName: 'border gt-divider bg-slate-400/8 text-slate-400',
      iconCircle: true,
      title: 'Hoàn tất',
    },
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
          <div className="gt-panel-soft grid gap-3 rounded-xl p-3.5">
            <div className="flex items-center gap-2.5 min-h-7">
              <IconBox size="sm" className="h-7 w-7 rounded-lg">
                <Copy size={16} />
              </IconBox>
              <h3 className="m-0 text-xs font-bold tracking-[0.13em] text-slate-200">THÔNG TIN ĐƠN HÀNG</h3>
            </div>

            <div className="gt-panel-soft grid gap-0 overflow-hidden rounded-xl">
              {orderInfoFields.map((field) => (
                <OrderDetailRow key={field.label} {...field} />
              ))}
            </div>
          </div>

          <div className="gt-panel-soft grid gap-3 rounded-xl p-3.5">
            <div className="flex items-center gap-2.5 min-h-7">
              <IconBox size="sm" className="h-7 w-7 rounded-lg border border-sky-400/10 bg-sky-400/8 text-sky-400">
                <WalletCards size={16} />
              </IconBox>
              <h3 className="m-0 text-xs font-bold tracking-[0.13em] text-slate-200">THÔNG TIN THANH TOÁN</h3>
            </div>

            <div className="gt-panel-soft grid gap-0 overflow-hidden rounded-xl">
              {paymentInfoFields.map((field) => (
                <OrderDetailRow key={field.label} {...field} />
              ))}
            </div>
          </div>
        </section>

        <aside className="gt-panel grid gap-3.5 rounded-2xl p-5">
          <div>
            <h2 className="m-0 text-xs font-bold tracking-[0.13em] text-slate-200">TRẠNG THÁI ĐƠN HÀNG</h2>
          </div>

          <div className="grid gap-4">
            {statusCards.map((card) => (
              <OrderStatusItem key={card.title} {...card} />
            ))}
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-cyan/10 bg-cyan/10 px-3.5 py-3 text-sm leading-[1.45] text-cyan-50">
            <BadgeCheck size={15} />
            <span>Admin sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất. Vui lòng không tạo lại đơn giống nhau.</span>
          </div>

          <Button
            type="button"
            variant="accent"
            className="w-full"
            onClick={() => {
              const gameId = activeGameId;
              resetWizard();

              if (gameId) {
                navigate({ name: 'games', gameId, step: 1 }, { replace: true });
                return;
              }

              navigate({ name: 'games' }, { replace: true });
            }}
          >
            <ArrowRight size={18} />
            Tạo đơn mới
          </Button>
        </aside>
      </div>
    </div>
  );
}

function OrderStatusItem({
  badgeClassName,
  badgeLabel,
  description,
  hint,
  icon,
  iconClassName,
  iconCircle = false,
  title,
}: OrderStatusCard) {
  return (
    <div className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-3.5">
      <IconBox
        size="sm"
        circle={iconCircle}
        className={classNames('h-10 w-10', iconClassName)}
      >
        {icon}
      </IconBox>
      <div className="pt-px">
        <div className="mb-1.5 flex items-center gap-2">
          <strong className="text-sm font-bold text-white">{title}</strong>
          <span className={classNames('rounded-full px-2.5 py-1 text-xs font-bold', badgeClassName)}>{badgeLabel}</span>
        </div>
        <p className="m-0 text-sm leading-[1.45] text-slate-300">{description}</p>
        {hint ? <small className="text-xs text-slate-400">{hint}</small> : null}
      </div>
    </div>
  );
}

function OrderDetailRow({
  compact = false,
  icon,
  label,
  last = false,
  value,
}: OrderDetailField) {
  return (
    <div
      className={classNames(
        compact ? 'grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-3 px-4 py-3' : 'grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-3 px-4 py-2.5',
        !last && 'border-b gt-divider',
      )}
    >
      <span className={classNames('inline-flex items-center gap-2 text-xs font-medium text-slate-400', compact && 'text-sm font-bold text-slate-200')}>
        {icon}
        {label}
      </span>
      {value}
    </div>
  );
}
