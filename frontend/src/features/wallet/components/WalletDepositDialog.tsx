import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Check, Copy, QrCode, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, DetailRow } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import { formatCurrency } from '@/shared/lib/format';
import { getDepositRequestStatus } from '@/features/deposits/lib/deposit-request-status';
import { useConfirmDepositTransferMutation, useCreateDepositRequestMutation } from '@/features/deposits/server';
import type { WalletDepositRequest } from '@/features/deposits/types';

type WalletDepositDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onViewHistory: () => void;
};

type FlowStep = 'amount' | 'payment' | 'success';

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000] as const;

export function WalletDepositDialog({ isOpen, onClose, onViewHistory }: WalletDepositDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const createDepositMutation = useCreateDepositRequestMutation();
  const confirmDepositMutation = useConfirmDepositTransferMutation();
  const [step, setStep] = useState<FlowStep>('amount');
  const [amount, setAmount] = useState('100000');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [request, setRequest] = useState<WalletDepositRequest | null>(null);
  const isBusy = createDepositMutation.isPending || confirmDepositMutation.isPending;

  const formattedAmount = useMemo(() => (amount ? formatCurrency(Number(amount)) : ''), [amount]);
  const status = request ? getDepositRequestStatus(request.status) : null;

  useEffect(() => {
    if (!isOpen) return;

    closeRef.current?.focus();
    setStep('amount');
    setAmount('100000');
    setAmountError(null);
    setCopiedKey(null);
    setRequest(null);
  }, [isOpen]);

  useEffect(() => {
    if (!copiedKey) return;

    const timer = window.setTimeout(() => setCopiedKey(null), 1400);
    return () => window.clearTimeout(timer);
  }, [copiedKey]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isBusy, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleCreateRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAmountError(null);

    const parsedAmount = Number.parseInt(amount.replace(/\D/g, ''), 10);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Vui lòng nhập số tiền hợp lệ.');
      return;
    }

    try {
      const created = await createDepositMutation.mutateAsync({ amount: parsedAmount });
      setRequest(created);
      setStep('payment');
      toast.success('Đã tạo yêu cầu nạp tiền.');
    } catch (error) {
      console.error(error);
      toast.error('Không thể tạo yêu cầu nạp tiền. Vui lòng thử lại.');
    }
  };

  const handleConfirmTransfer = async () => {
    if (!request) return;

    try {
      const confirmed = await confirmDepositMutation.mutateAsync({ requestId: request.id });
      setRequest(confirmed);
      setStep('success');
      toast.success('Đã xác nhận chuyển khoản.');
    } catch (error) {
      console.error(error);
      toast.error('Không thể xác nhận chuyển khoản. Vui lòng thử lại.');
    }
  };

  const handleCopy = async (key: string, value: string) => {
    if (!value.trim()) {
      toast.error('Không có nội dung để sao chép.');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      toast.success('Đã sao chép.');
    } catch {
      toast.error('Không thể sao chép lúc này.');
    }
  };

  const title =
    step === 'amount'
      ? 'Nạp tiền vào ví'
      : step === 'payment'
        ? 'Quét QR và chuyển khoản đúng nội dung'
        : 'Yêu cầu đã được gửi';

  const description =
    step === 'amount'
      ? 'Nhập số tiền cần nạp'
      : step === 'payment'
        ? 'Kiểm tra thông tin trước khi chuyển khoản'
        : 'Admin sẽ kiểm tra và duyệt giao dịch';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6">
      <button
        aria-label="Đóng"
        className="absolute inset-0 cursor-default bg-[rgba(5,11,24,0.8)] backdrop-blur-[8px]"
        onClick={isBusy ? undefined : onClose}
        type="button"
      />

      <div
        aria-modal="true"
        aria-labelledby="wallet-deposit-dialog-title"
        className="gt-panel relative z-10 w-full max-w-[840px] overflow-hidden rounded-[26px] border gt-border shadow-[0_30px_90px_rgba(2,6,23,0.5)]"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b gt-border px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--gt-primary)]">Nạp tiền vào ví</p>
            <h2 id="wallet-deposit-dialog-title" className="mt-2 text-[1.2rem] font-black tracking-tight gt-text">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 gt-text-muted">{description}</p>
          </div>

          <button
            ref={closeRef}
            aria-label="Đóng popup"
            className={classNames(
              'inline-flex size-10 shrink-0 items-center justify-center rounded-[14px] border gt-border bg-[var(--gt-card)] gt-text-soft transition-colors hover:border-[var(--gt-border-strong)] hover:bg-[var(--gt-card-hover)] hover:text-[var(--gt-text)]',
              isBusy && 'cursor-not-allowed opacity-50 hover:border-[var(--gt-border)] hover:bg-[var(--gt-card)] hover:text-[var(--gt-text-soft)]',
            )}
            onClick={onClose}
            disabled={isBusy}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {step === 'amount' ? (
            <form className="grid gap-6 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:items-start" onSubmit={handleCreateRequest}>
              <section className="grid gap-5">
                <div className="gt-card rounded-[18px] border gt-border px-4">
                  <div className="grid gap-1.5 py-3.5">
                    <DetailRow label="Phương thức">Chuyển khoản QR</DetailRow>
                    <DetailRow label="Xử lý">Sau khi admin duyệt</DetailRow>
                  </div>
                </div>

                <div className="grid gap-2.5">
                  <label htmlFor="wallet-deposit-amount" className="text-sm font-semibold gt-text-soft">
                    Số tiền nạp
                  </label>
                  <div className="relative">
                    <input
                      id="wallet-deposit-amount"
                      inputMode="numeric"
                      autoComplete="off"
                      value={formattedAmount}
                      onChange={(event) => {
                        const next = event.target.value.replace(/\D/g, '');
                        setAmount(next);
                        setAmountError(null);
                      }}
                      placeholder="100.000"
                      className="h-14 w-full rounded-[18px] border gt-border bg-[var(--gt-card)] px-4 pr-12 text-[1rem] font-semibold gt-text outline-none transition-all duration-200 placeholder:text-[var(--gt-text-disabled)] hover:border-[var(--gt-border-strong)] hover:bg-[var(--gt-card-hover)] focus:border-[var(--gt-primary-border)] focus:bg-[var(--gt-card-hover)] focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[0.95rem] font-semibold gt-text-muted">
                      đ
                    </span>
                  </div>
                  {amountError ? <p className="m-0 text-sm text-rose-300">{amountError}</p> : null}
                </div>

                <div className="grid gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--gt-primary)]">Gợi ý nhanh</p>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {QUICK_AMOUNTS.map((value) => {
                      const selected = amount === String(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setAmount(String(value))}
                          className={classNames(
                            'min-h-12 rounded-[14px] border px-3 py-3 text-sm font-semibold transition-all duration-200',
                            selected
                              ? 'border-[var(--gt-primary-border)] bg-[var(--gt-primary-soft)] text-[var(--gt-text)]'
                              : 'border-[var(--gt-border)] bg-[var(--gt-card)] gt-text-soft hover:border-[var(--gt-border-strong)] hover:bg-[var(--gt-card-hover)] hover:text-[var(--gt-text)]',
                          )}
                        >
                          {formatCurrency(value)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="gt-card rounded-[22px] px-4 py-4 sm:px-5 sm:py-5">
                <div className="mb-3">
                  <h3 className="text-[1.05rem] font-black tracking-tight gt-text">Thông tin</h3>
                </div>

                <div className="grid gap-0 rounded-[18px] border gt-border bg-[var(--gt-card)] px-4">
                  <DetailRow label="Phương thức">Chuyển khoản QR</DetailRow>
                  <DetailRow label="Xử lý">Sau khi admin duyệt</DetailRow>
                </div>

                <div className="mt-5 rounded-[18px] border gt-border bg-[var(--gt-card)] px-4 py-3.5">
                  <DetailRow label="Số tiền chọn">{amount ? formatCurrency(Number(amount)) : '---'}</DetailRow>
                  <DetailRow label="Trạng thái">Chưa tạo yêu cầu</DetailRow>
                </div>

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button className="sm:min-w-32" disabled={isBusy} variant="outline" onClick={onClose}>
                    Hủy
                  </Button>
                  <Button className="sm:min-w-40" disabled={isBusy || !amount.trim() || Number.parseInt(amount, 10) <= 0} variant="accent" type="submit">
                    {createDepositMutation.isPending ? 'Đang tạo yêu cầu...' : 'Tạo yêu cầu nạp'}
                  </Button>
                </div>
              </section>
            </form>
          ) : step === 'payment' && request ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:items-start">
              <section className="space-y-4">
                <div className="rounded-[22px] border border-[var(--gt-border-accent)] bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_42%)] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--gt-primary)]">QR thanh toán</p>
                    <Badge tone="primary">VietQR</Badge>
                  </div>

                  <div className="grid place-items-center">
                    {request.qrImageUrl ? (
                      <img src={request.qrImageUrl} alt="Mã QR chuyển khoản VietQR" className="max-w-full rounded-[16px]" />
                    ) : (
                    <div className="grid place-items-center gap-2 py-8 text-center gt-text-muted">
                        <QrCode size={26} />
                        <span>Không có mã QR</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-[22px] border gt-border bg-[var(--gt-card)] px-4 py-4 sm:px-5 sm:py-5">
                <div className="mb-3">
                  <h3 className="text-[1.05rem] font-black tracking-tight gt-text">Thông tin chuyển khoản</h3>
                </div>

                <div className="grid gap-0 rounded-[18px] border gt-border bg-[var(--gt-card)] px-4">
                  <DetailRow label="Số tiền">{formatCurrency(request.amount)}</DetailRow>
                  <DetailRow label="Ngân hàng">{resolveBankDisplayName(request.bankId)}</DetailRow>
                  <DetailRow label="Số tài khoản">{request.accountNo || '---'}</DetailRow>
                  <DetailRow label="Chủ tài khoản">{request.accountName || '---'}</DetailRow>
                  <DetailRow label="Nội dung CK">{request.transferContent}</DetailRow>
                </div>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    className="border gt-border bg-[var(--gt-card)] gt-text-soft hover:border-[var(--gt-border-strong)] hover:bg-[var(--gt-card-hover)] hover:text-[var(--gt-text)]"
                    onClick={() => void handleCopy('content', request.transferContent)}
                  >
                    {copiedKey === 'content' ? <Check size={14} /> : <Copy size={14} />}
                    Copy nội dung
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border gt-border bg-[var(--gt-card)] gt-text-soft hover:border-[var(--gt-border-strong)] hover:bg-[var(--gt-card-hover)] hover:text-[var(--gt-text)]"
                    onClick={() => void handleCopy('account', request.accountNo)}
                  >
                    {copiedKey === 'account' ? <Check size={14} /> : <Copy size={14} />}
                    Copy STK
                  </Button>
                </div>

                <p className="mt-4 rounded-[16px] border border-[rgba(245,158,11,0.18)] bg-[rgba(245,158,11,0.10)] p-4 text-sm leading-6 text-[var(--gt-warning)]">
                  Lưu ý: chuyển khoản đúng nội dung để admin đối soát nhanh hơn.
                </p>

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button className="sm:min-w-32" disabled={isBusy} variant="outline" onClick={onClose}>
                    Đóng
                  </Button>
                  <Button className="sm:min-w-44" disabled={isBusy} variant="accent" onClick={() => void handleConfirmTransfer()}>
                    {confirmDepositMutation.isPending ? 'Đang xác nhận...' : 'Tôi đã chuyển khoản'}
                  </Button>
                </div>
              </section>
            </div>
          ) : (
            <div className="mx-auto grid max-w-[520px] gap-5 py-2 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-[22px] border border-[rgba(34,197,94,0.18)] bg-[rgba(34,197,94,0.10)] text-[var(--gt-success)]">
                <CheckCircle2 size={34} />
              </div>

              <div className="space-y-2">
                <h3 className="text-[1.3rem] font-black tracking-tight gt-text">Yêu cầu đã được gửi</h3>
                <p className="text-sm leading-6 gt-text-soft">Admin sẽ kiểm tra và duyệt giao dịch.</p>
              </div>

              <div className="rounded-[18px] border gt-border bg-[var(--gt-card)] px-4 text-left">
                <DetailRow label="Số tiền">{request ? formatCurrency(request.amount) : '---'}</DetailRow>
                <DetailRow label="Mã yêu cầu">{request?.code ?? '---'}</DetailRow>
                <DetailRow label="Trạng thái">{status?.label ?? 'Chờ duyệt'}</DetailRow>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                <Button className="sm:min-w-36" variant="outline" onClick={onClose}>
                  Đóng
                </Button>
                <Button className="sm:min-w-40" variant="accent" onClick={onViewHistory}>
                  Xem lịch sử nạp
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function resolveBankDisplayName(bankId?: string): string {
  const normalized = bankId?.trim().toLowerCase();
  if (!normalized) {
    return 'Ngân hàng liên kết';
  }

  if (normalized === 'vcb' || normalized === 'vietcombank') return 'Vietcombank';
  if (normalized === 'mb' || normalized === 'mbbank') return 'MB Bank';
  if (normalized === 'acb') return 'ACB';
  return bankId ?? 'Ngân hàng liên kết';
}


