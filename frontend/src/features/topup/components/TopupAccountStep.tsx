import { ShoppingCart } from 'lucide-react';
import { Button, Field } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import type { GamePackage } from '@/features/games/types';

type TopupAccountStepProps = {
  gameAccountInfo: string;
  isAuthenticated: boolean;
  quantity: string;
  selectedPackage: GamePackage | null;
  onContinue: () => void;
  onGameAccountInfoChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
};

export function TopupAccountStep({
  gameAccountInfo,
  isAuthenticated,
  quantity,
  selectedPackage,
  onContinue,
  onGameAccountInfoChange,
  onQuantityChange,
}: TopupAccountStepProps) {
  const parsedQuantity = Number.parseInt(quantity, 10);
  const safeQuantity = Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;
  const total = selectedPackage ? selectedPackage.salePrice * safeQuantity : 0;

  return (
    <aside className="sticky top-24">
      <div className="gt-surface gt-panel rounded-lg">
        <h2 className="mb-4 text-base font-black text-white">Thông tin đơn hàng</h2>

        <div className="grid gap-4">
          <Field
            label="UID / Server / Tên nhân vật"
            value={gameAccountInfo}
            onChange={(event) => onGameAccountInfoChange(event.target.value)}
            placeholder="Ví dụ: UID 12345678"
          />
          <Field label="Số lượng" value={quantity} onChange={(event) => onQuantityChange(event.target.value)} type="number" placeholder="1" />

          <div className="grid gap-2 rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <span>Gói đã chọn</span>
              <strong className="text-white">{selectedPackage?.name ?? '---'}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Tổng tiền</span>
              <strong className="text-white">{formatCurrency(total)}</strong>
            </div>
          </div>

          <Button type="button" variant="accent" className="w-full" disabled={!isAuthenticated || !selectedPackage || !gameAccountInfo.trim()} onClick={onContinue}>
            <ShoppingCart size={19} />
            Tiếp tục
          </Button>

          {!isAuthenticated ? <p className="text-center text-sm text-red-400">Vui lòng đăng nhập để đặt đơn.</p> : null}
        </div>
      </div>
    </aside>
  );
}
