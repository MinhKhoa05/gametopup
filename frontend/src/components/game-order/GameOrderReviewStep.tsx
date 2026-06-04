import { CreditCard, Layers3, ShoppingCart, Tag, UserRound, WalletCards } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '../../lib/format';
import { pickImage } from '../../lib/ui';
import type { Route } from '../../lib/routes';
import { useOrderMutations } from '../../services/orders';
import type { Game, User, WalletInfo } from '../../types';
import { useGameOrderStore } from '../../store/game-order.store';

type Props = {
  game: Game;
  user: User | null;
  wallet: WalletInfo | null;
  walletLoading: boolean;
  navigate: (route: Route) => void;
};

export function GameOrderReviewStep({ game, user, wallet, walletLoading, navigate }: Props) {
  const checkoutPackage = useGameOrderStore((state) => state.checkoutPackage);
  const checkoutQuantity = useGameOrderStore((state) => state.checkoutQuantity);
  const checkoutGameAccountInfo = useGameOrderStore((state) => state.checkoutGameAccountInfo);
  const setStep = useGameOrderStore((state) => state.setStep);
  const setCheckoutSuccess = useGameOrderStore((state) => state.setCheckoutSuccess);
  const checkoutTotal = checkoutPackage ? checkoutPackage.salePrice * checkoutQuantity : 0;
  const walletBalance = wallet?.balance ?? 0;
  const shortage = Math.max(0, checkoutTotal - walletBalance);
  const orderMutations = useOrderMutations();

  if (!checkoutPackage) {
    return <EmptyState>Vui lòng hoàn tất thông tin bước trước.</EmptyState>;
  }

  return (
    <div className="topup-checkout-body">
      <section className="topup-checkout-card">
        <div className="topup-order-head">
          <img className="topup-order-head__image" src={pickImage(game)} alt={game.name} />
          <div className="min-w-0">
            <p className="eyebrow">Bước 2</p>
            <h1>Thanh toán</h1>
            <p className="topup-order-head__package">
              Gói nạp: <span>{checkoutPackage.name}</span>
            </p>
          </div>
        </div>
        <div className="topup-section-divider" aria-hidden="true" />

        <div className="topup-order-details">
          <div className="topup-order-detail">
            <span className="topup-order-detail__label">
              <UserRound size={14} />
              UID / Server / Tên nhân vật
            </span>
            <strong>{checkoutGameAccountInfo}</strong>
          </div>
          <div className="topup-order-detail">
            <span className="topup-order-detail__label">
              <Layers3 size={14} />
              Số lượng
            </span>
            <strong>{checkoutQuantity}</strong>
          </div>
          <div className="topup-order-detail">
            <span className="topup-order-detail__label">
              <Tag size={14} />
              Giá gói
            </span>
            <strong>{formatCurrency(checkoutPackage.salePrice)}</strong>
          </div>
        </div>
        <div className="topup-section-divider" aria-hidden="true" />

        <div className="topup-breakdown">
          <div className="topup-breakdown__row">
            <span>Tạm tính</span>
            <strong>{formatCurrency(checkoutTotal)}</strong>
          </div>
          <div className="topup-breakdown__row">
            <span>Giảm giá</span>
            <strong className="topup-breakdown__discount">-0 đ</strong>
          </div>
          <div className="topup-breakdown__row topup-breakdown__row--total">
            <span>Tổng thanh toán</span>
            <strong>{formatCurrency(checkoutTotal)}</strong>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" className="btn-outline w-full" onClick={() => setStep(1)}>
            Quay lại
          </button>
          <button
            type="button"
            className="btn-primary w-full"
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
              } catch {
                // Toasts are handled by the shared mutation hooks.
              }
            }}
            disabled={orderMutations.place.isPending || orderMutations.pay.isPending || !user || walletLoading || shortage > 0}
          >
            <ShoppingCart size={19} />
            {walletLoading ? 'Đang tải ví' : shortage > 0 ? 'Thiếu tiền' : 'Thanh toán bằng ví'}
          </button>
        </div>
      </section>

      <aside className="topup-payment-card">
        <h2 className="topup-payment-card__title">
          <CreditCard size={18} />
          Chọn hình thức thanh toán
        </h2>

        <div className="topup-wallet-summary">
          <div className="topup-wallet-summary__icon">
            <WalletCards size={28} />
          </div>
          <div className="topup-wallet-summary__content">
            <p className="topup-wallet-summary__heading">Số dư ví của bạn</p>
            <div className="topup-wallet-summary__stack">
              <div className="topup-wallet-summary__line">
                <span>Số dư hiện tại</span>
                <strong className="topup-wallet-summary__value--balance">{formatCurrency(walletBalance)}</strong>
              </div>
              <div className="topup-wallet-summary__line">
                <span>Cần thanh toán</span>
                <strong className="topup-wallet-summary__value--due">{formatCurrency(checkoutTotal)}</strong>
              </div>
              <div className="topup-wallet-summary__divider" aria-hidden="true" />
              <div className="topup-wallet-summary__line topup-wallet-summary__line--shortage">
                <span>Thiếu</span>
                <strong>{formatCurrency(shortage)}</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="topup-section-divider" aria-hidden="true" />

        <button type="button" className="topup-payment-option" onClick={() => navigate({ name: 'wallet' })}>
          <div className="topup-payment-option__icon">
            <WalletCards size={18} />
          </div>
          <div className="min-w-0">
            <strong>Nạp thêm tiền vào ví</strong>
            <span>Nạp tiền để thanh toán đơn hàng này.</span>
          </div>
          <span className="topup-payment-option__status topup-payment-option__status--muted" aria-hidden="true">
            ○
          </span>
        </button>
      </aside>
    </div>
  );
}
