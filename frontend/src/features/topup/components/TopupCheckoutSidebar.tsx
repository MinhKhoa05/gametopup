import { ShoppingCart } from 'lucide-react';
import { Button } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { GamePackage } from '@/features/games/types';

type TopupCheckoutSidebarProps = {
  busy: boolean;
  gameAccountInfo: string;
  isAuthenticated: boolean;
  walletBalance: number;
  walletLoading: boolean;
  selectedPackage: GamePackage | null;
  onPurchase: () => void;
  onGameAccountInfoChange: (value: string) => void;
};

export function TopupCheckoutSidebar({
  busy,
  gameAccountInfo,
  isAuthenticated,
  walletBalance,
  walletLoading,
  selectedPackage,
  onPurchase,
  onGameAccountInfoChange,
}: TopupCheckoutSidebarProps) {
  const total = selectedPackage ? selectedPackage.salePrice : 0;
  const shortage = walletLoading ? 0 : Math.max(0, total - walletBalance);
  const canPurchase = !busy && isAuthenticated && !!selectedPackage && !!gameAccountInfo.trim() && !walletLoading && shortage === 0;
  const helperText = !isAuthenticated
    ? 'Vui lòng đăng nhập để đặt đơn.'
    : !selectedPackage
      ? 'Vui lòng chọn gói nạp.'
      : !gameAccountInfo.trim()
        ? 'Nhập UID / Server để tiếp tục.'
        : shortage > 0
          ? `Cần nạp thêm ${formatCurrency(shortage)}.`
          : 'Sẵn sàng tạo đơn.';

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-[24px] border border-white/8 bg-[rgba(7,13,25,0.94)] p-4 shadow-[0_18px_44px_rgba(2,6,23,0.24)] sm:p-5">
        <div className="space-y-2">
          <h2 className="text-[1.12rem] font-black tracking-tight text-white">Tóm tắt đơn hàng</h2>
          <p className="text-sm leading-6 text-slate-400">Thông tin nhân vật và thanh toán luôn hiển thị ở đây.</p>
        </div>

        <div className="mt-4 grid gap-4">
          <div className="rounded-[18px] border border-white/8 bg-white/[0.02] px-4 py-3">
            <SummaryLine label="Gói đã chọn" value={selectedPackage?.name ?? 'Chưa chọn gói nào'} />
            <Divider />
            <SummaryLine label="Giá gói" value={selectedPackage ? formatCurrency(total) : '—'} />
            <Divider />
            <SummaryLine label="Số dư ví" value={walletLoading ? 'Đang tải...' : formatCurrency(walletBalance)} />
            <Divider />
            <SummaryLine label="Cần thanh toán" value={walletLoading || !selectedPackage ? '—' : formatCurrency(shortage)} valueClassName={shortage > 0 ? 'text-amber-300' : 'text-emerald-300'} />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-300">UID / Server</label>
            <input
              className="h-12 rounded-[14px] border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-cyan/50"
              placeholder="Ví dụ: UID 12345678"
              value={gameAccountInfo}
              onChange={(event) => onGameAccountInfoChange(event.target.value)}
            />
          </div>

          <Button type="button" variant="accent" className="w-full" disabled={!canPurchase} onClick={onPurchase}>
            <ShoppingCart size={18} />
            Mua ngay
          </Button>

          <p className={classNames('text-sm leading-6', !isAuthenticated ? 'text-red-400' : shortage > 0 ? 'text-amber-300' : 'text-slate-400')}>{helperText}</p>
        </div>
      </div>
    </aside>
  );
}

function SummaryLine({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="min-w-0 text-sm text-slate-400">{label}</span>
      <span className={classNames('text-right text-sm font-semibold text-white', valueClassName)}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="my-1 h-px bg-white/8" />;
}
