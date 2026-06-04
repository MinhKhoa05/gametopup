import { FormEvent } from 'react';
import { ShieldCheck, ShoppingCart } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { Field } from '../ui/Field';
import { SectionHeading } from '../ui/SectionHeading';
import { formatCurrency } from '../../lib/format';
import { classNames, pickImage } from '../../lib/ui';
import type { Game, User } from '../../types';
import type { GameOrderPackage } from '../../hooks/game-order.hooks';
import { useGameOrderStore } from '../../store/game-order.store';

type Props = {
  game: Game;
  packages: GameOrderPackage[];
  isLoading: boolean;
  user: User | null;
};

export function GameOrderPackageStep({ game, packages, isLoading, user }: Props) {
  const selectedPackageId = useGameOrderStore((state) => state.selectedPackageId);
  const quantity = useGameOrderStore((state) => state.quantity);
  const gameAccountInfo = useGameOrderStore((state) => state.gameAccountInfo);
  const setSelectedPackageId = useGameOrderStore((state) => state.setSelectedPackageId);
  const setQuantity = useGameOrderStore((state) => state.setQuantity);
  const setGameAccountInfo = useGameOrderStore((state) => state.setGameAccountInfo);
  const startCheckout = useGameOrderStore((state) => state.startCheckout);
  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId) ?? null;
  const total = selectedPackage ? selectedPackage.salePrice * quantity : 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPackage) return;

    startCheckout({ selectedPackage, gameName: game.name });
  }

  return (
    <div className="topup-body">
      <div className="topup-main">
        <div className="topup-game-card">
          <div className="topup-game-card__image">
            <img src={pickImage(game)} alt={game.name} />
          </div>
          <div className="min-w-0">
            <p className="eyebrow">Bước 1</p>
            <h1>Chọn gói nạp</h1>
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <ShieldCheck size={16} /> Dịch vụ nạp trung gian chiết khấu
            </div>
          </div>
        </div>

        <SectionHeading eyebrow={game.name} title="Chọn gói nạp" />

        {isLoading && packages.length === 0 ? (
          <PackageGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4 md:gap-[14px]">
            {packages.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id;

              return (
                <button
                  key={pkg.id}
                  type="button"
                  className={classNames('topup-package-card min-h-[190px] md:min-h-[210px]', isSelected && 'selected')}
                  onClick={() => setSelectedPackageId(pkg.id)}
                >
                  {pkg.discount > 0 && <span className="discount">-{pkg.discount}%</span>}
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
                  {pkg.discount > 0 && (
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

          <form onSubmit={handleSubmit}>
            <Field label="UID / Server / Tên nhân vật" value={gameAccountInfo} onChange={setGameAccountInfo} placeholder="Ví dụ: UID 12345678" />
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

            <button type="submit" className="btn-primary w-full" disabled={!user || !selectedPackage || !gameAccountInfo.trim()}>
              <ShoppingCart size={19} />
              Mua ngay
            </button>

            {!user && <p className="mt-3 text-center text-sm text-red-400">Vui lòng đăng nhập để đặt đơn.</p>}
          </form>
        </div>
      </aside>
    </div>
  );
}

export function PackageGridSkeleton() {
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
