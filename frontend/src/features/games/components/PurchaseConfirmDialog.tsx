import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, X } from 'lucide-react';
import { Button } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { Game, GamePackage } from '@/features/games/types';

type PurchaseDraft = {
  characterName: string;
  gameAccountInfo: string;
};

type PurchaseConfirmDialogProps = {
  busy: boolean;
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (draft: PurchaseDraft) => void;
  selectedPackage: GamePackage;
  walletBalance: number;
};

type PurchaseSuccessDialogProps = {
  game: Game;
  isOpen: boolean;
  onContinue: () => void;
  onViewOrders: () => void;
  packageItem: GamePackage;
  result: {
    orderId: number;
    successAt: string;
  };
};

export function PurchaseConfirmDialog({ busy, game, isOpen, onClose, onConfirm, selectedPackage, walletBalance }: PurchaseConfirmDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [gameAccountInfo, setGameAccountInfo] = useState('');
  const [characterName, setCharacterName] = useState('');
  const total = selectedPackage.salePrice;
  const afterPayment = Math.max(0, walletBalance - total);
  const canConfirm = !!gameAccountInfo.trim() && !!characterName.trim();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeRef.current?.focus();
    setGameAccountInfo('');
    setCharacterName('');
  }, [isOpen, selectedPackage.id]);

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
  }, [busy, isOpen, onClose]);

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

  const handleConfirm = () => {
    if (!canConfirm) {
      return;
    }

    onConfirm({
      characterName: characterName.trim(),
      gameAccountInfo: gameAccountInfo.trim(),
    });
  };

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
        aria-labelledby="purchase-confirm-title"
        aria-modal="true"
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,34,0.98),rgba(7,13,25,0.98))] shadow-[0_30px_90px_rgba(2,6,23,0.52)]"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200/85">Xác nhận mua</p>
            <h2 id="purchase-confirm-title" className="mt-2 text-[1.2rem] font-black tracking-tight text-white">
              Mua {selectedPackage.name}
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
          <div className="grid gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
            <ConfirmRow label="Game" value={game.name} />
            <ConfirmRow label="Gói nạp" value={selectedPackage.name} />
            <ConfirmRow label="Giá" value={formatCurrency(total)} />
            <ConfirmRow label="Số dư ví" value={formatCurrency(walletBalance)} />
            <ConfirmRow label="Sau thanh toán" value={formatCurrency(afterPayment)} valueClassName="text-emerald-300" />
          </div>

          <div className="grid gap-3">
            <Field label="UID / Server" value={gameAccountInfo} onChange={setGameAccountInfo} placeholder="Ví dụ: 12345678 / S1" />
            <Field label="Tên nhân vật" value={characterName} onChange={setCharacterName} placeholder="Ví dụ: Khoa Pro" />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button className="sm:min-w-32" disabled={busy} variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button className="sm:min-w-40" disabled={busy || !canConfirm} variant="accent" onClick={handleConfirm}>
              {busy ? 'Đang tạo đơn...' : 'Xác nhận mua'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PurchaseSuccessDialog({ game, isOpen, onContinue, onViewOrders, packageItem, result }: PurchaseSuccessDialogProps) {
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
        aria-labelledby="purchase-success-title"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[24px] border border-emerald-400/14 bg-[linear-gradient(180deg,rgba(7,17,27,0.98),rgba(6,12,22,0.98))] shadow-[0_30px_90px_rgba(2,6,23,0.5)]"
        role="dialog"
      >
        <div className="px-5 py-5 text-center sm:px-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] border border-emerald-400/16 bg-emerald-400/10 text-emerald-300">
            <BadgeCheck size={34} />
          </div>

          <h2 id="purchase-success-title" className="mt-4 text-[1.35rem] font-black tracking-tight text-white">
            Đơn hàng đã được tạo
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Chúng tôi đã ghi nhận đơn nạp cho <span className="font-semibold text-white">{game.name}</span>.
          </p>

          <div className="mt-5 grid gap-2 rounded-[18px] border border-white/8 bg-white/[0.03] p-4 text-left text-sm">
            <ConfirmRow label="Gói nạp" value={packageItem.name} />
            <ConfirmRow label="Mã đơn" value={orderCode} />
            <ConfirmRow label="Thời gian" value={successTime} />
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

function ConfirmRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-2.5 last:border-b-0 last:pb-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={classNames('text-right text-sm font-semibold text-white', valueClassName)}>{value}</span>
    </div>
  );
}

function Field({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-300">{label}</span>
      <input
        className="h-12 rounded-[14px] border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-cyan/50"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
