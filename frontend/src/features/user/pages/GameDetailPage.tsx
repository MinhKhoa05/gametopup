import { FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Home, ShoppingCart, ShieldCheck } from 'lucide-react';
import { pickImage, classNames } from '../../../lib/ui';
import { formatCurrency } from '../../../lib/format';
import { Game, GamePackage } from '../../../types';
import { Field } from '../../../components/common/Field';
import { EmptyState } from '../../../components/common/EmptyState';
import { SectionHeading } from '../../../components/common/SectionHeading';
import { Route } from '../../../lib/routes';
import { useAuthStore } from '../../../store/auth.store';

export function GameDetailPage({
  game,
  packages,
  packagesLoading,
  selectedPackageId,
  setSelectedPackageId,
  quantity,
  setQuantity,
  gameAccountInfo,
  setGameAccountInfo,
  total,
  selectedPackage,
  busy,
  onSubmit,
  navigate,
}: {
  game: Game | null;
  packages: GamePackage[];
  packagesLoading: boolean;
  selectedPackageId: number | null;
  setSelectedPackageId: (id: number) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  gameAccountInfo: string;
  setGameAccountInfo: (value: string) => void;
  total: number;
  selectedPackage: GamePackage | null;
  busy: boolean;
  onSubmit: (event: FormEvent) => void;
  navigate: (route: Route) => void;
}) {
  const user = useAuthStore((state) => state.user);
  if (!game) return <EmptyState>Không tìm thấy game.</EmptyState>;

  return (
    <div className="topup-page">
      <div className="mb-5 flex items-center gap-2 text-sm text-slate-400">
        <Home size={16} />
        <ChevronRight size={14} />
        <span>Tất cả Game</span>
        <ChevronRight size={14} />
        <span className="font-bold text-white">{game.name}</span>
      </div>

      <div className="topup-shell">
        <div className="topup-steps" aria-label="Tiến trình đặt hàng">
          {['Xác nhận thông tin', 'Chọn gói nạp', 'Thanh toán'].map((step, index) => (
            <div key={step} className={classNames('topup-step', index === 1 && 'active')}>
              <span>{index < 1 ? <CheckCircle2 size={14} /> : index + 1}</span>
              <small>{step}</small>
            </div>
          ))}
        </div>

        <button className="topup-back" type="button" onClick={() => navigate({ name: 'games' })}>
          <ArrowLeft size={15} />
          Quay lại danh sách game
        </button>

        <div className="topup-body">
          <div className="topup-main">
            <div className="topup-game-card">
              <img src={pickImage(game)} alt={game.name} />
              <div>
                <p className="eyebrow">Gói nạp</p>
                <h1>{game.name}</h1>
                <div className="flex items-center gap-2 text-sm font-extrabold text-amber-300">
                  <ShieldCheck size={16} /> Dịch vụ nạp trung gian chiết khấu
                </div>
              </div>
            </div>

            <SectionHeading eyebrow={game.name} title="Chọn gói nạp" />

            {packagesLoading ? (
              <div className="rounded-[10px] border border-dashed border-white/10 bg-ink-lighter px-6 py-6 text-center text-slate-400">
                Đang tải gói nạp...
              </div>
            ) : (
              <div className="topup-package-grid">
                {packages.map((pkg) => {
                  const discount = pkg.originalPrice > 0 ? Math.round(100 - (pkg.salePrice / pkg.originalPrice) * 100) : 0;
                  const isSelected = selectedPackageId === pkg.id;

                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      className={classNames('topup-package-card', isSelected && 'selected')}
                      onClick={() => setSelectedPackageId(pkg.id)}
                    >
                      {discount > 0 && <span className="discount">-{discount}%</span>}
                      <div className="mb-[9px] aspect-[1/0.82] overflow-hidden rounded-[6px] bg-ink-dark">
                        <img src={pickImage(pkg)} alt={pkg.name} className="h-full w-full object-cover" />
                      </div>
                      <strong>{pkg.name}</strong>
                      <small>Còn {pkg.stockQuantity} suất</small>
                      <div className="package-price">{formatCurrency(pkg.salePrice)}</div>
                      {discount > 0 && <div className="package-original">{formatCurrency(pkg.originalPrice)}</div>}
                    </button>
                  );
                })}
                {packages.length === 0 && <EmptyState className="col-span-full py-8">Chưa có gói nạp.</EmptyState>}
              </div>
            )}
          </div>

          <aside className="topup-summary">
            <div className="gametopup-surface rounded-[8px] border-cyanline/16">
              <h2>Thông tin đơn hàng</h2>

              <form onSubmit={onSubmit}>
                <Field
                  label="UID / Server / Tên nhân vật"
                  value={gameAccountInfo}
                  onChange={setGameAccountInfo}
                  placeholder="Ví dụ: UID 12345678"
                />

                <Field
                  label="Số lượng"
                  value={String(quantity)}
                  onChange={(value) => setQuantity(Math.max(1, Number(value) || 1))}
                  type="number"
                  placeholder="1"
                />

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

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={!user || !selectedPackage || !gameAccountInfo.trim() || busy}
                >
                  <ShoppingCart size={19} />
                  Mua ngay
                </button>

                {!user && <p className="mt-3 text-center text-sm text-red-400">Vui lòng đăng nhập để đặt đơn.</p>}
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
