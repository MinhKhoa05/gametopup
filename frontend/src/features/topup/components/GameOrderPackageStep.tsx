import type { ChangeEvent, FormEvent } from 'react';
import { memo, useCallback } from 'react';
import { ShieldCheck, ShoppingCart } from 'lucide-react';
import { Button, EmptyState, Field, ImageField } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import { classNames, pickImage } from '@/lib/ui';
import { useRoute } from '@/hooks/common/route.hooks';
import type { Game } from '@/features/games/games.types';
import type { User } from '@/features/user/user.types';
import type { GameOrderPackage } from '@/features/topup/hooks/topup.hooks';
import { useGameOrderStore } from '@/features/topup/store/topup.store';
import { GameOrderStepBanner } from './GameOrderStepBanner';

type Props = {
  game: Game;
  packages: GameOrderPackage[];
  isLoading: boolean;
  user: User | null;
};

export function GameOrderPackageStep({ game, packages, isLoading, user }: Props) {
  const { navigate } = useRoute();
  const selectedPackageId = useGameOrderStore((state) => state.selectedPackageId);
  const quantity = useGameOrderStore((state) => state.quantity);
  const gameAccountInfo = useGameOrderStore((state) => state.gameAccountInfo);
  const setSelectedPackageId = useGameOrderStore((state) => state.setSelectedPackageId);
  const setQuantity = useGameOrderStore((state) => state.setQuantity);
  const setGameAccountInfo = useGameOrderStore((state) => state.setGameAccountInfo);
  const startCheckout = useGameOrderStore((state) => state.startCheckout);
  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId) ?? null;
  const total = selectedPackage ? selectedPackage.salePrice * quantity : 0;
  const handleSelectPackage = useCallback((packageId: number) => setSelectedPackageId(packageId), [setSelectedPackageId]);
  const handleQuantityChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setQuantity(Math.max(1, Number(event.target.value) || 1));
    },
    [setQuantity],
  );
  const handleGameAccountInfoChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setGameAccountInfo(event.target.value);
    },
    [setGameAccountInfo],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPackage) return;

    startCheckout({ selectedPackage, gameName: game.name });
    navigate({ name: 'games', gameId: game.id, step: 2 });
  }

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <PackageSelectionPanel
        game={game}
        isLoading={isLoading}
        onSelectPackage={handleSelectPackage}
        packages={packages}
        selectedPackageId={selectedPackageId}
      />

      <OrderSummarySidebar
        gameAccountInfo={gameAccountInfo}
        onGameAccountInfoChange={handleGameAccountInfoChange}
        onQuantityChange={handleQuantityChange}
        onSubmit={handleSubmit}
        quantity={quantity}
        selectedPackage={selectedPackage}
        total={total}
        user={user}
      />
    </div>
  );
}

const PackageSelectionPanel = memo(function PackageSelectionPanel({
  game,
  isLoading,
  onSelectPackage,
  packages,
  selectedPackageId,
}: {
  game: Game;
  isLoading: boolean;
  onSelectPackage: (packageId: number) => void;
  packages: GameOrderPackage[];
  selectedPackageId: number | null;
}) {
  return (
    <div className="grid gap-4">
      <GameOrderStepBanner
        afterTitle={
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <ShieldCheck size={16} /> Dịch vụ nạp trung gian chiết khấu
          </div>
        }
        eyebrow="Bước 1"
        imageAlt={game.name}
        imageSrc={pickImage(game)}
        title="Chọn gói nạp"
      />

      {isLoading && packages.length === 0 ? (
        <PackageGridSkeleton />
      ) : packages.length === 0 ? (
        <EmptyState variant="compact">Chưa có gói nạp.</EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3.5">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} isSelected={selectedPackageId === pkg.id} onSelect={onSelectPackage} packageItem={pkg} />
          ))}
        </div>
      )}
    </div>
  );
});

const PackageCard = memo(function PackageCard({
  isSelected,
  onSelect,
  packageItem,
}: {
  isSelected: boolean;
  onSelect: (packageId: number) => void;
  packageItem: GameOrderPackage;
}) {
  return (
    <button
      type="button"
      className={classNames(
        'gt-panel relative flex min-h-48 flex-col items-stretch rounded-lg p-2.5 text-center text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/20 hover:bg-[rgba(255,255,255,0.035)] md:min-h-[210px]',
        isSelected && 'border-cyan/20 bg-[rgba(255,255,255,0.035)] shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_10px_22px_rgba(0,0,0,0.22)]',
      )}
      onClick={() => onSelect(packageItem.id)}
    >
      {packageItem.discount > 0 && (
        <span className="absolute right-2.5 top-2.5 z-[1] rounded-full bg-emerald-500 px-2 py-0.5 text-[0.68rem] font-black text-slate-950">
          -{packageItem.discount}%
        </span>
      )}
      <div className="mb-2.5 aspect-[1/0.82] overflow-hidden rounded-md bg-slate-950/65">
        <ImageField src={pickImage(packageItem)} alt={packageItem.name} className="h-full w-full object-cover" />
      </div>
      <strong className="flex min-h-10 items-center justify-center text-[0.95rem] font-black leading-[1.25] text-white">{packageItem.name}</strong>
      <small className="mb-2 block text-[0.72rem] font-extrabold text-slate-400">Còn {packageItem.stockQuantity} suất</small>
      <div
        className={classNames(
          'mt-auto w-full rounded-md py-1.5 text-sm font-extrabold transition-colors',
          isSelected ? 'bg-cyan text-ink' : 'bg-cyan/15 text-cyan-50',
        )}
      >
        {formatCurrency(packageItem.salePrice)}
      </div>
      {packageItem.discount > 0 && (
        <div className="mt-1.5 text-[0.75rem] font-bold text-slate-500 line-through">
          {formatCurrency(packageItem.originalPrice)}
        </div>
      )}
    </button>
  );
});

const OrderSummarySidebar = memo(function OrderSummarySidebar({
  gameAccountInfo,
  onGameAccountInfoChange,
  onQuantityChange,
  onSubmit,
  quantity,
  selectedPackage,
  total,
  user,
}: {
  gameAccountInfo: string;
  onGameAccountInfoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onQuantityChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  quantity: number;
  selectedPackage: GameOrderPackage | null;
  total: number;
  user: User | null;
}) {
  return (
    <aside className="sticky top-24">
      <div className="gt-surface gt-panel rounded-lg">
        <h2 className="mb-4 text-base font-black text-white">Thông tin đơn hàng</h2>

        <form onSubmit={onSubmit}>
          <Field
            label="UID / Server / Tên nhân vật"
            value={gameAccountInfo}
            onChange={onGameAccountInfoChange}
            placeholder="Ví dụ: UID 12345678"
          />
          <Field
            label="Số lượng"
            value={String(quantity)}
            onChange={onQuantityChange}
            type="number"
            placeholder="1"
          />

          <div className="flex justify-between gap-3 border-t gt-divider py-2.5 text-sm text-slate-400">
            <span>Gói đã chọn</span>
            <strong>{selectedPackage?.name ?? '---'}</strong>
          </div>
          <div className="flex justify-between gap-3 border-t gt-divider py-2.5 text-sm text-slate-400">
            <span>Tổng tiền hàng</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <div className="flex items-center justify-between gap-3 border-t gt-divider py-2.5 text-sm font-bold text-white">
            <span>Tổng thanh toán</span>
            <strong>{formatCurrency(total)}</strong>
          </div>

          <Button type="submit" variant="accent" className="w-full" disabled={!user || !selectedPackage || !gameAccountInfo.trim()}>
            <ShoppingCart size={19} />
            Mua ngay
          </Button>

          {!user && <p className="mt-3 text-center text-sm text-red-400">Vui lòng đăng nhập để đặt đơn.</p>}
        </form>
      </div>
    </aside>
  );
});

export function PackageGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3.5" aria-busy="true" aria-label="Đang tải gói nạp">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={`package-skeleton-${index}`}
          className="relative flex min-h-48 flex-col items-stretch rounded-lg border border-white/[0.06] bg-ink-lighter p-2.5 text-center md:min-h-[210px]"
          aria-hidden="true"
        >
          <div className="mb-2.5 aspect-[1/0.82] overflow-hidden rounded-md bg-ink-dark">
            <div className="h-full w-full animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.03)_8%,rgba(255,255,255,0.12)_18%,rgba(255,255,255,0.03)_33%)] bg-[length:200%_100%]" />
          </div>
          <div className="mb-2 h-4 w-3/4 animate-pulse rounded-full bg-white/8" />
          <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/6" />
          <div className="mt-auto h-8 w-full rounded-md bg-white/8" />
        </div>
      ))}
    </div>
  );
}
