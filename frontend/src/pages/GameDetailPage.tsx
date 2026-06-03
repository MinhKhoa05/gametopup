import { FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Home, ShoppingCart, ShieldCheck } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { Field } from '../components/common/Field';
import { SectionHeading } from '../components/common/SectionHeading';
import { Route } from '../lib/routes';
import { classNames, pickImage } from '../lib/ui';
import { formatCurrency } from '../lib/format';
import { Game, GamePackage } from '../types';
import { useAuthStore } from '../store/auth.store';

export function GameDetailPage({
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
  selectedPackage,
  busy,
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
  selectedPackage: GamePackage | null;
  busy: boolean;
  onSubmit: (event: FormEvent) => void;
  navigate: (route: Route) => void;
}) {
  const user = useAuthStore((state) => state.user);

  if (gameLoading && !game) return <GameDetailSkeleton />;
  if (!game) return <EmptyState>Không tìm thấy game.</EmptyState>;

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
          {['Xác nhận thông tin', 'Chọn gói nạp', 'Thanh toán'].map((step, index) => (
            <div key={step} className={classNames('topup-step', index === 1 && 'active')}>
              <span>{index < 1 ? <CheckCircle2 size={14} /> : index + 1}</span>
              <small>{step}</small>
            </div>
          ))}
        </div>

        <button
          className="mb-4 inline-flex items-center gap-2 border-0 bg-transparent p-0 text-[0.84rem] font-bold text-slate-400 hover:text-cyan-50"
          type="button"
          onClick={() => navigate({ name: 'games' })}
        >
          <ArrowLeft size={15} />
          Quay lại danh sách game
        </button>

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

function GameDetailSkeleton() {
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
