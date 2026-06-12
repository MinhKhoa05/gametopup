import { ShoppingCart } from 'lucide-react';
import { Button, Field } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import type { GamePackage } from '@/features/games/types';

type TopupAccountStepProps = {
  busy: boolean;
  gameAccountInfo: string;
  isAuthenticated: boolean;
  walletBalance: number;
  walletLoading: boolean;
  selectedPackage: GamePackage | null;
  onPurchase: () => void;
  onGameAccountInfoChange: (value: string) => void;
};

export function TopupAccountStep({
  busy,
  gameAccountInfo,
  isAuthenticated,
  walletBalance,
  walletLoading,
  selectedPackage,
  onPurchase,
  onGameAccountInfoChange,
}: TopupAccountStepProps) {
  const total = selectedPackage ? selectedPackage.salePrice : 0;
  const shortage = walletLoading ? 0 : Math.max(0, total - walletBalance);

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

          <div className="grid gap-2 rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <span>Gói đã chọn</span>
              <strong className="text-white">{selectedPackage?.name ?? '---'}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Giá gói</span>
              <strong className="text-white">{formatCurrency(total)}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Số dư ví</span>
              <strong className={walletLoading ? 'text-slate-400' : 'text-cyan-50'}>{walletLoading ? 'Đang tải...' : formatCurrency(walletBalance)}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Cần thêm</span>
              <strong className={walletLoading ? 'text-slate-400' : shortage > 0 ? 'text-amber-300' : 'text-emerald-300'}>{walletLoading ? 'Đang tải...' : formatCurrency(shortage)}</strong>
            </div>
          </div>

          <Button
            type="button"
            variant="accent"
            className="w-full"
            disabled={busy || !isAuthenticated || !selectedPackage || !gameAccountInfo.trim() || walletLoading || shortage > 0}
            onClick={onPurchase}
          >
            <ShoppingCart size={19} />
            Mua ngay
          </Button>

          {!isAuthenticated ? <p className="text-center text-sm text-red-400">Vui lòng đăng nhập để đặt đơn.</p> : null}
          {isAuthenticated && shortage > 0 ? <p className="text-center text-sm text-amber-300">Ví không đủ số dư để mua gói này.</p> : null}
        </div>
      </div>
    </aside>
  );
}
