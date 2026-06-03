import { FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, CreditCard, Home, Layers3, ShoppingCart, ShieldCheck, Tag, UserRound, WalletCards } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Field } from '../components/ui/Field';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Route } from '../lib/routes';
import { classNames, pickImage } from '../lib/ui';
import { formatCurrency } from '../lib/format';
import { Game, GamePackage, WalletInfo } from '../types';
import { User } from '../types';

export function GameOrderPage({
  game,
  gameLoading,
  packages,
  packagesLoading,
  selectedPackageId,
  setSelectedPackageId,
  quantity,
  setQuantity,
  gameAccountInfo,
  setGameAccountInfo,
  total,
  checkoutStep,
  checkoutPackage,
  checkoutGameAccountInfo,
  checkoutQuantity,
  checkoutSubtotal,
  checkoutTotal,
  onResetCheckout,
  onPayOrder,
  wallet,
  selectedPackage,
  busy,
  user,
  onSubmit,
  navigate,
}: {
  game: Game | null;
  gameLoading: boolean;
  packages: GamePackage[];
  packagesLoading: boolean;
  selectedPackageId: number | null;
  setSelectedPackageId: (id: number) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  gameAccountInfo: string;
  setGameAccountInfo: (value: string) => void;
  total: number;
  checkoutStep: 2 | 3;
  checkoutPackage: GamePackage | null;
  checkoutGameAccountInfo: string;
  checkoutQuantity: number;
  checkoutSubtotal: number;
  checkoutTotal: number;
  onResetCheckout: () => void;
  onPayOrder: () => Promise<void>;
  wallet: WalletInfo | null;
  selectedPackage: GamePackage | null;
  busy: boolean;
  user: User | null;
  onSubmit: (event: FormEvent) => void;
  navigate: (route: Route) => void;
}) {
  if (gameLoading && !game) return <GameOrderSkeleton />;
  if (!game) return <EmptyState>Không tìm thấy game.</EmptyState>;

  const selectedPackageLabel = checkoutPackage?.name ?? selectedPackage?.name ?? '---';
  const checkoutImage = game;
  const walletBalance = wallet?.balance ?? 0;
  const shortage = Math.max(0, checkoutTotal - walletBalance);

  return (
    <div className="mx-auto max-w-[1120px]">
      <div className="mb-5 flex items-center gap-2 text-sm text-slate-400">
        <Home size={16} />
        <ChevronRight size={14} />
        <span>Tất cả Game</span>
        <ChevronRight size={14} />
        <span className="font-bold text-white">{game.name}</span>
      </div>

      <div className="gametopup-surface p-[22px] max-[760px]:p-4">
        <div className="topup-steps" aria-label="Tiến trình đặt hàng">
          {['Xác nhận thông tin', 'Chọn gói nạp', 'Thanh toán'].map((step, index) => {
            const stepNumber = index + 1;
            const isActive = checkoutStep === stepNumber;
            const isCompleted = checkoutStep > stepNumber;

            return (
              <div key={step} className={classNames('topup-step', isCompleted && 'completed', isActive && 'active')}>
                <span>{isCompleted ? <CheckCircle2 size={14} /> : stepNumber}</span>
                <small>{step}</small>
              </div>
            );
          })}
        </div>

        <button
          className="mb-4 inline-flex items-center gap-2 border-0 bg-transparent p-0 text-[0.84rem] font-bold text-slate-400 hover:text-cyan-50"
          type="button"
          onClick={() => navigate({ name: 'games' })}
        >
          <ArrowLeft size={15} />
          Quay lại danh sách game
        </button>

        {checkoutStep === 3 && checkoutPackage ? (
          <div className="topup-checkout-body">
            <section className="topup-checkout-card">
              <div className="topup-order-head">
                <img className="topup-order-head__image" src={pickImage(checkoutImage)} alt={game.name} />
                <div className="min-w-0">
                  <p className="eyebrow">THÔNG TIN ĐƠN HÀNG</p>
                  <h1>{game.name}</h1>
                  <p className="topup-order-head__package">
                    Gói nạp: <span>{selectedPackageLabel}</span>
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
                  <strong>{formatCurrency(checkoutPackage?.salePrice ?? selectedPackage?.salePrice ?? 0)}</strong>
                </div>
              </div>
              <div className="topup-section-divider" aria-hidden="true" />

              <div className="topup-breakdown">
                <div className="topup-breakdown__row">
                  <span>Tạm tính</span>
                  <strong>{formatCurrency(checkoutSubtotal)}</strong>
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

              <button type="button" className="btn-outline w-full" onClick={onResetCheckout}>
                <ArrowLeft size={16} />
                Quay lại chọn gói
              </button>
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

              <div className="topup-payment-option topup-payment-option--selected">
                <div className="topup-payment-option__icon">
                  <WalletCards size={18} />
                </div>
                <div className="min-w-0">
                  <strong>Thanh toán bằng ví GameTopUp</strong>
                  <span>Thanh toán nhanh chóng với số dư hiện có.</span>
                </div>
                <span className="topup-payment-option__status" aria-hidden="true">
                  ●
                </span>
              </div>

              <button type="button" className="topup-payment-option" onClick={() => navigate({ name: 'wallet' })}>
                <div className="topup-payment-option__icon topup-payment-option__icon--alt">
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

              {shortage > 0 ? (
                <div className="topup-warning">
                  <p className="font-bold text-amber-200">Số dư của bạn không đủ để thanh toán đơn hàng.</p>
                  <p>Vui lòng nạp thêm tiền hoặc chọn phương thức thanh toán khác.</p>
                </div>
              ) : null}

              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => {
                  if (shortage > 0) {
                    navigate({ name: 'wallet' });
                    return;
                  }

                  void onPayOrder();
                }}
                disabled={busy || !user || !checkoutPackage}
              >
                <ShoppingCart size={19} />
                {shortage > 0 ? 'Nạp thêm tiền để thanh toán' : 'Thanh toán bằng ví'}
              </button>
            </aside>
          </div>
        ) : (
          <div className="topup-body">
            <div className="topup-main">
              <div className="topup-game-card">
                <div className="topup-game-card__image">
                  <img src={pickImage(game)} alt={game.name} />
                </div>
                <div className="min-w-0">
                  <p className="eyebrow">Gói nạp</p>
                  <h1>{game.name}</h1>
                  <div className="flex items-center gap-2 text-sm font-extrabold text-amber-300">
                    <ShieldCheck size={16} /> Dịch vụ nạp trung gian chiết khấu
                  </div>
                </div>
              </div>

              <SectionHeading eyebrow={game.name} title="Chọn gói nạp" />

              {packagesLoading && packages.length === 0 ? (
                <PackageGridSkeleton />
              ) : (
                <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4 md:gap-[14px]">
                  {packages.map((pkg) => {
                    const discount = pkg.originalPrice > 0 ? Math.round(100 - (pkg.salePrice / pkg.originalPrice) * 100) : 0;
                    const isSelected = selectedPackageId === pkg.id;

                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        className={classNames('topup-package-card min-h-[190px] md:min-h-[210px]', isSelected && 'selected')}
                        onClick={() => setSelectedPackageId(pkg.id)}
                      >
                        {discount > 0 && <span className="discount">-{discount}%</span>}
                        <div className="mb-[9px] aspect-[1/0.82] overflow-hidden rounded-[6px] bg-ink-dark">
                          <img src={pickImage(pkg)} alt={pkg.name} className="h-full w-full object-cover" />
                        </div>
                        <strong>{pkg.name}</strong>
                        <small>Còn {pkg.stockQuantity} suất</small>
                        <div
                          className={classNames(
                            'mt-auto w-full rounded-[6px] py-[6px] text-sm font-extrabold transition-colors',
                            isSelected ? 'bg-cyanline text-ink' : 'bg-cyanline/35 text-cyan-50',
                          )}
                        >
                          {formatCurrency(pkg.salePrice)}
                        </div>
                        {discount > 0 && (
                          <div className="mt-[6px] text-[0.75rem] font-bold text-slate-500 line-through">
                            {formatCurrency(pkg.originalPrice)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {packages.length === 0 && <EmptyState className="col-span-full py-8">Chưa có gói nạp.</EmptyState>}
                </div>
              )}
            </div>

            <aside className="sticky top-24">
              <div className="gametopup-surface rounded-[8px] border-cyanline/16">
                <h2 className="mb-4 text-base font-black text-white">Thông tin đơn hàng</h2>

                <form onSubmit={onSubmit}>
                  <Field label="UID / Server / Tên nhân vật" value={gameAccountInfo} onChange={setGameAccountInfo} placeholder="Ví dụ: UID 12345678" />
                  <Field label="Số lượng" value={String(quantity)} onChange={(value) => setQuantity(Math.max(1, Number(value) || 1))} type="number" placeholder="1" />

                  <div className="gametopup-summary-row">
                    <span>Gói đã chọn</span>
                    <strong>{selectedPackage?.name ?? '---'}</strong>
                  </div>
                  <div className="gametopup-summary-row">
                    <span>Tổng tiền hàng</span>
                    <strong>{formatCurrency(total)}</strong>
                  </div>
                  <div className="gametopup-summary-row gametopup-summary-row--total">
                    <span>Tổng thanh toán</span>
                    <strong>{formatCurrency(total)}</strong>
                  </div>

                  <label className="mb-4 mt-3 flex items-start gap-2 text-[0.74rem] leading-[1.35] text-slate-400">
                    <input className="mt-0.5 accent-cyanline" type="checkbox" checked readOnly />
                    <span>Tôi đã đọc và đồng ý với các điều khoản sử dụng dịch vụ.</span>
                  </label>

                  <button type="submit" className="btn-primary w-full" disabled={!user || !selectedPackage || !gameAccountInfo.trim() || busy}>
                    <ShoppingCart size={19} />
                    Mua ngay
                  </button>

                  {!user && <p className="mt-3 text-center text-sm text-red-400">Vui lòng đăng nhập để đặt đơn.</p>}
                </form>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function PackageGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4 md:gap-[14px]" aria-busy="true" aria-label="Đang tải gói nạp">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={`package-skeleton-${index}`} className="topup-package-card min-h-[190px] md:min-h-[210px]" aria-hidden="true">
          <div className="mb-[9px] aspect-[1/0.82] overflow-hidden rounded-[6px] bg-ink-dark">
            <div className="h-full w-full animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.03)_8%,rgba(255,255,255,0.12)_18%,rgba(255,255,255,0.03)_33%)] bg-[length:200%_100%]" />
          </div>
          <div className="mb-2 h-4 w-3/4 animate-pulse rounded-full bg-white/8" />
          <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/6" />
          <div className="mt-auto h-8 w-full rounded-[6px] bg-white/8" />
        </div>
      ))}
    </div>
  );
}

function GameOrderSkeleton() {
  return (
    <div className="mx-auto max-w-[1120px]" aria-busy="true" aria-label="Đang tải chi tiết game">
      <div className="mb-5 flex items-center gap-2 text-sm text-slate-400">
        <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-36 animate-pulse rounded-full bg-white/10" />
      </div>

      <div className="gametopup-surface p-[22px] max-[760px]:p-4">
        <div className="topup-steps" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`step-skeleton-${index}`} className={classNames('topup-step', index === 1 && 'active')}>
              <span className="animate-pulse bg-white/10 text-transparent">0</span>
              <small className="h-3 w-20 animate-pulse rounded-full bg-white/10 text-transparent" />
            </div>
          ))}
        </div>

        <div className="mb-4 h-4 w-48 animate-pulse rounded-full bg-white/10" />

        <div className="topup-body">
          <div className="topup-main">
            <div className="topup-game-card">
              <div className="topup-game-card__image">
                <div className="h-full w-full animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.03)_8%,rgba(255,255,255,0.12)_18%,rgba(255,255,255,0.03)_33%)] bg-[length:200%_100%]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 h-3 w-24 animate-pulse rounded-full bg-white/10" />
                <div className="mb-3 h-8 w-3/4 animate-pulse rounded-full bg-white/10" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
              </div>
            </div>

            <div className="mb-4 h-5 w-40 animate-pulse rounded-full bg-white/10" />
            <PackageGridSkeleton />
          </div>

          <aside className="sticky top-24">
            <div className="gametopup-surface rounded-[8px] border-cyanline/16">
              <div className="mb-4 h-5 w-40 animate-pulse rounded-full bg-white/10" />
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`field-skeleton-${index}`} className="h-12 rounded-xl bg-white/6" aria-hidden="true" />
                ))}
                <div className="h-11 rounded-xl bg-white/8" />
                <div className="h-12 rounded-xl bg-white/8" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
