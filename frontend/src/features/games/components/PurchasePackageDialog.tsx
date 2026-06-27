import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, X } from 'lucide-react';
import { Button, ImageBox, DetailRow } from '@/shared/components';
import { formatCurrency, formatDateTimeShort } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { Game, GamePackage } from '@/features/games/contracts';

type PackagePurchaseDraft = {
  characterName: string;
  uidServer: string;
};

type PackagePurchaseDialogProps = {
  busy: boolean;
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (draft: PackagePurchaseDraft) => void;
  selectedPackage: GamePackage;
  walletBalance: number;
};

type PurchaseSuccessDialogProps = {
  game: Game;
  isOpen: boolean;
  onContinue: () => void;
  onViewOrders: () => void;
  packageItem: GamePackage;
  purchaseInfo: {
    characterName: string;
    uidServer: string;
  };
  result: {
    orderId: number;
    successAt: string;
  };
};

export function PackagePurchaseDialog({ busy, game, isOpen, onClose, onConfirm, selectedPackage, walletBalance }: PackagePurchaseDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [uidServer, setUidServer] = useState('');
  const [characterName, setCharacterName] = useState('');

  const salePrice = selectedPackage.salePrice;
  const afterPayment = Math.max(0, walletBalance - salePrice);
  const canConfirm = !!uidServer.trim();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeRef.current?.focus();
    setUidServer('');
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
      uidServer: uidServer.trim(),
      characterName: characterName.trim(),
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6">
      <button
        aria-label="Đóng"
        className="absolute inset-0 cursor-default bg-[rgba(5,11,24,0.8)] backdrop-blur-[8px]"
        onClick={busy ? undefined : onClose}
        type="button"
      />

      <div
        aria-labelledby="purchase-confirm-title"
        aria-modal="true"
        className="gt-panel relative z-10 w-full max-w-[840px] overflow-hidden rounded-[26px] border gt-border shadow-[0_30px_90px_rgba(2,6,23,0.52)]"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b gt-border px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--gt-primary)]">Xác nhận đơn hàng</p>
            <h2 id="purchase-confirm-title" className="mt-2 text-[1.2rem] font-black tracking-tight gt-text">
              Kiểm tra thông tin trước khi đặt
            </h2>
          </div>

          <button
            ref={closeRef}
            aria-label="Đóng popup"
            className={classNames(
              'inline-flex size-10 shrink-0 items-center justify-center rounded-[14px] border gt-border bg-[var(--gt-card)] gt-text-soft transition-colors hover:border-[var(--gt-border-strong)] hover:bg-[var(--gt-card-hover)] hover:text-[var(--gt-text)]',
              busy && 'cursor-not-allowed opacity-50 hover:border-[var(--gt-border)] hover:bg-[var(--gt-card)] hover:text-[var(--gt-text-soft)]',
            )}
            onClick={onClose}
            disabled={busy}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-start">
            <div className="grid gap-6">
              <section className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative h-[96px] w-[96px] shrink-0 overflow-hidden rounded-[16px] border gt-border bg-[var(--gt-card)]">
                    <ImageBox src={selectedPackage.imageUrl} alt={selectedPackage.name} className="h-full w-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <BadgeCheck size={18} className="shrink-0 text-[var(--gt-primary)]" />
                      <h3
                        className="max-w-full overflow-hidden text-[1.05rem] font-black leading-[1.15] gt-text [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                        title={selectedPackage.name}
                      >
                        {selectedPackage.name}
                      </h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 gt-text-muted">{game.name}</p>
                  </div>
                </div>

                <div className="rounded-[18px] border gt-border bg-[var(--gt-card)] px-4">
                  <DetailRow label="Tên gói">{selectedPackage.name}</DetailRow>
                  <DetailRow label="Giá gốc"><span className="line-through gt-text-disabled">{formatCurrency(selectedPackage.originalPrice)}</span></DetailRow>
                  <DetailRow label="Giá bán">{formatCurrency(salePrice)}</DetailRow>
                  <DetailRow label="Tiết kiệm">
                    {`${formatCurrency(selectedPackage.originalPrice - salePrice)} (-${Math.max(1, Math.round((1 - salePrice / selectedPackage.originalPrice) * 100))}%)`}
                  </DetailRow>
                </div>
              </section>

              <section className="space-y-3">
                <div>
                  <h3 className="text-[1.08rem] font-black tracking-tight gt-text">Thanh toán</h3>
                </div>

                <div className="rounded-[18px] border gt-border bg-[var(--gt-card)] px-4">
                  <DetailRow label="Số dư ví">{formatCurrency(walletBalance)}</DetailRow>
                  <DetailRow label="Số cần trả">{formatCurrency(salePrice)}</DetailRow>
                  <DetailRow label="Số dư sau mua">{formatCurrency(afterPayment)}</DetailRow>
                </div>
              </section>
            </div>

            <div className="lg:border-l lg:border-[var(--gt-border)] lg:pl-6 lg:self-stretch">
              <div className="space-y-3">
                <div className="space-y-2">
                  <h3 className="text-[1.08rem] font-black tracking-tight text-[var(--gt-text)]">Thông tin nhân vật</h3>
                  <p className="text-sm leading-6 gt-text-muted">Nhập UID / Server và tên nhân vật nếu có.</p>
                </div>

                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold gt-text-soft">
                      UID / Server <span className="text-rose-300">*</span>
                    </span>
                    <input
                      className="gt-input h-12 rounded-[14px] border gt-border bg-[var(--gt-panel)] px-4 text-sm gt-text outline-none transition-all placeholder:text-[var(--gt-text-disabled)] hover:border-[var(--gt-border-strong)] hover:bg-[var(--gt-panel-hover)] focus:border-[var(--gt-primary-border)] focus:bg-[var(--gt-panel-hover)] focus:shadow-[0_0_0_2px_rgba(34,211,238,0.075)]"
                      placeholder="Ví dụ: 12345678 / S1"
                      value={uidServer}
                      onChange={(event) => setUidServer(event.target.value)}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold gt-text-soft">Tên nhân vật</span>
                    <input
                      className="gt-input h-12 rounded-[14px] border gt-border bg-[var(--gt-panel)] px-4 text-sm gt-text outline-none transition-all placeholder:text-[var(--gt-text-disabled)] hover:border-[var(--gt-border-strong)] hover:bg-[var(--gt-panel-hover)] focus:border-[var(--gt-primary-border)] focus:bg-[var(--gt-panel-hover)] focus:shadow-[0_0_0_2px_rgba(34,211,238,0.075)]"
                      placeholder="Không bắt buộc"
                      value={characterName}
                      onChange={(event) => setCharacterName(event.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-1 lg:col-span-2 sm:flex-row sm:justify-end">
              <Button className="sm:min-w-32" disabled={busy} variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button className="sm:min-w-40" disabled={busy || !canConfirm} variant="primary" onClick={handleConfirm}>
                {busy ? 'Đang tạo đơn...' : 'Đặt hàng'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PackagePurchaseDialog as PurchasePackageDialog };

export function PurchaseSuccessDialog({ game, isOpen, onContinue, onViewOrders, packageItem, purchaseInfo, result }: PurchaseSuccessDialogProps) {
  const successTime = formatDateTimeShort(result.successAt);
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
      <button aria-label="Đóng" className="absolute inset-0 cursor-default bg-[rgba(5,11,24,0.8)] backdrop-blur-[8px]" onClick={onContinue} type="button" />

      <div
        aria-labelledby="purchase-success-title"
        aria-modal="true"
        className="gt-panel relative z-10 w-full max-w-[520px] overflow-hidden rounded-[24px] border gt-border shadow-[0_30px_90px_rgba(2,6,23,0.5)]"
        role="dialog"
      >
        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--gt-success)]">Đã hoàn tất</p>
              <h2 id="purchase-success-title" className="mt-2 text-[1.35rem] font-black tracking-tight gt-text">
                Đơn hàng đã được tạo
              </h2>
              <p className="mt-2 text-sm leading-6 gt-text-soft">
                Chúng tôi đã ghi nhận đơn nạp cho <span className="font-semibold gt-text">{game.name}</span>.
              </p>
            </div>

            <div className="grid size-11 shrink-0 place-items-center rounded-[18px] border border-[rgba(34,197,94,0.18)] bg-[rgba(34,197,94,0.08)] text-[var(--gt-success)]">
              <BadgeCheck size={26} />
            </div>
          </div>

          <div className="mt-5 rounded-[18px] border gt-border bg-[var(--gt-card)] px-4">
            <DetailRow label="Gói nạp">{packageItem.name}</DetailRow>
            <DetailRow label="Giá gói">{formatCurrency(packageItem.salePrice)}</DetailRow>
            <DetailRow label="Tài khoản nạp">{purchaseInfo.uidServer}</DetailRow>
            <DetailRow label="Nhân vật">{purchaseInfo.characterName || 'Không có'}</DetailRow>
            <DetailRow label="Mã đơn">{orderCode}</DetailRow>
            <DetailRow label="Thời gian">{successTime}</DetailRow>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button className="sm:min-w-32" variant="outline" onClick={onContinue}>
              Tiếp tục nạp
            </Button>
            <Button className="sm:min-w-36" variant="primary" onClick={onViewOrders}>
              Xem đơn hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
