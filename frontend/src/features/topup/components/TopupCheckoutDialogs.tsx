import { useEffect, useRef } from 'react';
import { BadgeCheck, X } from 'lucide-react';
import { Button } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { Game, GamePackage } from '@/features/games/types';
import type { TopupCheckoutResult } from '@/features/topup/types';

type TopupConfirmDialogProps = {
  busy: boolean;
  game: Game;
  gameAccountInfo: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedPackage: GamePackage;
  walletBalance: number;
};

type TopupSuccessDialogProps = {
  game: Game;
  isOpen: boolean;
  onContinue: () => void;
  onViewOrders: () => void;
  packageItem: GamePackage;
  result: TopupCheckoutResult;
};

export function TopupConfirmDialog({
  busy,
  game,
  gameAccountInfo,
  isOpen,
  onClose,
  onConfirm,
  selectedPackage,
  walletBalance,
}: TopupConfirmDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = selectedPackage.salePrice;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6">
      <button
        aria-label="Đóng"
        className="absolute inset-0 cursor-default bg-slate-950/72 backdrop-blur-[2px]"
        onClick={busy ? undefined : onClose}
        type="button"
      />

      <div
        aria-labelledby="topup-confirm-title"
        aria-modal="true"
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,34,0.98),rgba(7,13,25,0.98))] shadow-[0_30px_90px_rgba(2,6,23,0.52)]"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200/85">Xác nhận mua</p>
            <h2 id="topup-confirm-title" className="mt-2 text-[1.25rem] font-black tracking-tight text-white">
              Kiểm tra thông tin đơn hàng
            </h2>
          </div>

          <button
            ref={closeRef}
            aria-label="Đóng popup"
            className={classNames(
              'inline-flex size-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white',
              busy && 'cursor-not-allowed opacity-50 hover:border-white/10 hover:bg-white/[0.03] hover:text-slate-300',
            )}
            onClick={onClose}
            disabled={busy}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:px-6">
          <div className="grid gap-3 rounded-[24px] border border-cyan-400/12 bg-cyan-400/[0.04] p-4">
            <DialogRow label="Game" value={game.name} />
            <DialogRow label="Gói nạp" value={selectedPackage.name} />
            <DialogRow label="UID / Server" value={gameAccountInfo} />
            <DialogRow label="Số tiền" value={formatCurrency(total)} />
            <DialogRow label="Số dư ví" value={formatCurrency(walletBalance)} />
          </div>

          <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-slate-300">
            Đơn hàng sẽ được tạo ngay sau khi bạn xác nhận. Hãy kiểm tra lại UID / Server trước khi tiếp tục.
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button className="sm:min-w-32" disabled={busy} variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button className="sm:min-w-40" disabled={busy} variant="accent" onClick={onConfirm}>
              {busy ? 'Đang tạo đơn...' : 'Xác nhận mua'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TopupSuccessDialog({ game, isOpen, onContinue, onViewOrders, packageItem, result }: TopupSuccessDialogProps) {
  const successTime = result.successAt
    ? new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(result.successAt))
    : '--/--/---- - --:--';
  const orderCode = `#GTU-${String(result.orderId).padStart(6, '0')}`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onContinue();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onContinue]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6">
      <button aria-label="Đóng" className="absolute inset-0 cursor-default bg-slate-950/72 backdrop-blur-[2px]" onClick={onContinue} type="button" />

      <div
        aria-labelledby="topup-success-title"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[28px] border border-emerald-400/14 bg-[linear-gradient(180deg,rgba(7,17,27,0.98),rgba(6,12,22,0.98))] shadow-[0_30px_90px_rgba(2,6,23,0.5)]"
        role="dialog"
      >
        <div className="px-5 py-5 text-center sm:px-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] border border-emerald-400/16 bg-emerald-400/10 text-emerald-300">
            <BadgeCheck size={34} />
          </div>

          <h2 id="topup-success-title" className="mt-4 text-[1.4rem] font-black tracking-tight text-white">
            Đơn hàng đã được tạo
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Chúng tôi đã ghi nhận đơn nạp cho <span className="font-semibold text-white">{game.name}</span>.
          </p>

          <div className="mt-5 grid gap-2 rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-left text-sm">
            <DialogRow label="Gói nạp" value={packageItem.name} />
            <DialogRow label="Mã đơn" value={orderCode} />
            <DialogRow label="Thời gian" value={successTime} />
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <Button className="sm:min-w-32" variant="outline" onClick={onContinue}>
              Tiếp tục nạp
            </Button>
            <Button className="sm:min-w-36" variant="accent" onClick={onViewOrders}>
              Xem đơn hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DialogRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={classNames('grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-4 rounded-[18px] border border-white/8 bg-[rgba(8,14,26,0.66)] px-4 py-3')}>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
