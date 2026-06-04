import { ArrowRight, BadgeCheck, CheckCircle2, Clock3, Copy, Gift, Gamepad2, Layers3, PackageCheck, UserRound, WalletCards } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '../../lib/format';
import { useGameOrderStore } from '../../store/game-order.store';

export function GameOrderSuccessStep() {
  const checkoutPackage = useGameOrderStore((state) => state.checkoutPackage);
  const checkoutGameName = useGameOrderStore((state) => state.checkoutGameName);
  const checkoutOrderId = useGameOrderStore((state) => state.checkoutOrderId);
  const checkoutSuccessAt = useGameOrderStore((state) => state.checkoutSuccessAt);
  const checkoutGameAccountInfo = useGameOrderStore((state) => state.checkoutGameAccountInfo);
  const checkoutQuantity = useGameOrderStore((state) => state.checkoutQuantity);
  const resetWizard = useGameOrderStore((state) => state.resetWizard);

  if (!checkoutPackage || !checkoutOrderId || !checkoutGameName) {
    return <EmptyState>Không tìm thấy đơn hàng.</EmptyState>;
  }

  const checkoutSubtotal = checkoutPackage.salePrice * checkoutQuantity;
  const checkoutTotal = checkoutSubtotal;
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

  return (
    <div className="topup-success-stack">
      <section className="topup-success-banner-panel">
        <div className="topup-success-banner__mark">
          <div className="topup-success-banner__icon">
            <CheckCircle2 size={36} />
          </div>
        </div>

        <div className="topup-success-banner__content">
          <h1>Đặt hàng thành công!</h1>
          <p className="topup-success-banner__lead">Đơn hàng của bạn đã được ghi nhận và đang chờ admin xử lý.</p>
          <p>Cảm ơn bạn đã tin tưởng lựa chọn GameTopUp. Chúng tôi sẽ xử lý đơn hàng trong thời gian sớm nhất.</p>
        </div>

        <div className="topup-success-banner__art" aria-hidden="true">
          <div className="topup-success-banner__gift">
            <Gift size={52} />
          </div>
          <div className="topup-success-banner__pad">
            <Gamepad2 size={44} />
          </div>
        </div>
      </section>

      <div className="topup-success-body">
        <section className="topup-success-card">
          <div className="topup-success-section">
            <div className="topup-success-section__head">
              <div className="topup-success-section__icon">
                <Copy size={16} />
              </div>
              <h3>THÔNG TIN ĐƠN HÀNG</h3>
            </div>

            <div className="topup-success-summary">
              <div className="topup-success-summary__row">
                <span className="topup-success-summary__label">
                  <Copy size={14} />
                  Mã đơn hàng
                </span>
                <strong className="topup-success-summary__value topup-success-summary__value--code">{orderCode}</strong>
              </div>
              <div className="topup-success-summary__row">
                <span className="topup-success-summary__label">
                  <BadgeCheck size={14} />
                  Game
                </span>
                <strong className="topup-success-summary__value">{checkoutGameName}</strong>
              </div>
              <div className="topup-success-summary__row">
                <span className="topup-success-summary__label">
                  <PackageCheck size={14} />
                  Gói nạp
                </span>
                <strong className="topup-success-summary__value">{checkoutPackage.name}</strong>
              </div>
              <div className="topup-success-summary__row">
                <span className="topup-success-summary__label">
                  <UserRound size={14} />
                  UID / Server / Tên nhân vật
                </span>
                <strong className="topup-success-summary__value">{checkoutGameAccountInfo}</strong>
              </div>
              <div className="topup-success-summary__row">
                <span className="topup-success-summary__label">
                  <Layers3 size={14} />
                  Số lượng
                </span>
                <strong className="topup-success-summary__value">{checkoutQuantity}</strong>
              </div>
            </div>
          </div>

          <div className="topup-success-section">
            <div className="topup-success-section__head">
              <div className="topup-success-section__icon topup-success-section__icon--payment">
                <WalletCards size={16} />
              </div>
              <h3>THÔNG TIN THANH TOÁN</h3>
            </div>

            <div className="topup-success-summary">
              <div className="topup-success-summary__row">
                <span className="topup-success-summary__label">
                  <WalletCards size={14} />
                  Hình thức
                </span>
                <strong className="topup-success-summary__value">Ví GameTopUp</strong>
              </div>
              <div className="topup-success-summary__row">
                <span className="topup-success-summary__label">
                  <Layers3 size={14} />
                  Tạm tính
                </span>
                <strong className="topup-success-summary__value">{formatCurrency(checkoutSubtotal)}</strong>
              </div>
              <div className="topup-success-summary__row">
                <span className="topup-success-summary__label">
                  <BadgeCheck size={14} />
                  Giảm giá
                </span>
                <strong className="topup-success-summary__value topup-success-summary__value--discount">-0 đ</strong>
              </div>
              <div className="topup-success-summary__row topup-success-summary__row--total">
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(checkoutTotal)}</strong>
              </div>
            </div>
          </div>
        </section>

        <aside className="topup-success-aside">
          <div className="topup-success-aside__head">
            <h2>TRẠNG THÁI ĐƠN HÀNG</h2>
          </div>

          <div className="topup-success-timeline">
            <div className="topup-success-timeline__item topup-success-timeline__item--done">
              <div className="topup-success-timeline__icon">
                <CheckCircle2 size={18} />
              </div>
              <div className="topup-success-timeline__content">
                <div className="topup-success-timeline__head">
                  <strong>Đã thanh toán</strong>
                  <span className="topup-success-timeline__badge topup-success-timeline__badge--done">Hoàn tất</span>
                </div>
                <p>{successTime}</p>
              </div>
            </div>

            <div className="topup-success-timeline__item topup-success-timeline__item--active">
              <div className="topup-success-timeline__icon topup-success-timeline__icon--active">
                <Clock3 size={18} />
              </div>
              <div className="topup-success-timeline__content">
                <div className="topup-success-timeline__head">
                  <strong>Chờ admin xử lý</strong>
                  <span className="topup-success-timeline__badge topup-success-timeline__badge--active">Đang xử lý</span>
                </div>
                <p>Admin sẽ kiểm tra và nạp trong ít phút.</p>
                <small>Ước tính: 1 - 5 phút</small>
              </div>
            </div>

            <div className="topup-success-timeline__item topup-success-timeline__item--pending">
              <div className="topup-success-timeline__icon topup-success-timeline__icon--pending">
                <PackageCheck size={18} />
              </div>
              <div className="topup-success-timeline__content">
                <div className="topup-success-timeline__head">
                  <strong>Hoàn tất</strong>
                  <span className="topup-success-timeline__badge topup-success-timeline__badge--pending">Chưa hoàn tất</span>
                </div>
                <p>Sẽ thông báo khi nạp thành công.</p>
              </div>
            </div>
          </div>

          <div className="topup-success-timeline-note">
            <BadgeCheck size={15} />
            <span>Admin sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất. Vui lòng không tạo lại đơn giống nhau.</span>
          </div>

          <button type="button" className="btn-primary w-full" onClick={resetWizard}>
            <ArrowRight size={18} />
            Tạo đơn mới
          </button>
        </aside>
      </div>
    </div>
  );
}
