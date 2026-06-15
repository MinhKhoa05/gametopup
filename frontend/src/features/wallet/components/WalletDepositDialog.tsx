import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Check, Copy, CreditCard, QrCode, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import { formatCurrency } from '@/shared/lib/format';
import { getDepositRequestStatus } from '@/features/wallet/lib/deposit-request-status';
import { useConfirmDepositTransferMutation, useCreateDepositRequestMutation } from '@/features/wallet/server';
import type { DepositRequest } from '@/features/wallet/types';

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
  const [request, setRequest] = useState<DepositRequest | null>(null);
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
        className="absolute inset-0 cursor-default bg-slate-950/72 backdrop-blur-[6px]"
        onClick={isBusy ? undefined : onClose}
        type="button"
      />

      <div
        aria-modal="true"
        aria-labelledby="wallet-deposit-dialog-title"
        className="relative z-10 w-full max-w-[840px] overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_34%),linear-gradient(180deg,rgba(10,18,34,0.98),rgba(7,13,25,0.99))] shadow-[0_30px_90px_rgba(2,6,23,0.52)]"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200/85">Nạp tiền vào ví</p>
            <h2 id="wallet-deposit-dialog-title" className="mt-2 text-[1.2rem] font-black tracking-tight text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </div>

          <button
            ref={closeRef}
            aria-label="Đóng popup"
            className={classNames(
              'inline-flex size-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white',
              isBusy && 'cursor-not-allowed opacity-50 hover:border-white/10 hover:bg-white/[0.03] hover:text-slate-300',
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
                <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.02] px-4">
                  <div className="grid gap-1.5 py-3.5">
                    <InfoRow label="Phương thức" labelClassName="!text-cyan-300" value="Chuyển khoản QR" valueClassName="!text-white" />
                    <InfoRow label="Xử lý" labelClassName="!text-amber-300" value="Sau khi admin duyệt" valueClassName="!text-amber-100" />
                  </div>
                </div>

                <div className="grid gap-2.5">
                  <label htmlFor="wallet-deposit-amount" className="text-sm font-semibold text-slate-200">
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
                      className="h-14 w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 pr-12 text-[1rem] font-semibold tracking-[0.01em] text-white outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-cyan-300/30 hover:bg-[rgba(255,255,255,0.05)] focus:border-cyan-300/55 focus:bg-[rgba(255,255,255,0.05)] focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[0.95rem] font-semibold text-slate-400">
                      đ
                    </span>
                  </div>
                  {amountError ? <p className="m-0 text-sm text-rose-300">{amountError}</p> : null}
                </div>

                <div className="grid gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/85">Gợi ý nhanh</p>
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
                              ? 'border-cyan-300/75 bg-cyan-400/12 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_0_22px_rgba(34,211,238,0.16)]'
                              : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-300/30 hover:bg-white/[0.05] hover:text-white',
                          )}
                        >
                          {formatCurrency(value)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="rounded-[22px] border border-white/[0.06] bg-white/[0.02] px-4 py-4 sm:px-5 sm:py-5">
                <div className="mb-3">
                  <h3 className="text-[1.05rem] font-black tracking-tight text-white">Thông tin</h3>
                </div>

                <div className="grid gap-0 rounded-[18px] border border-white/[0.06] bg-white/[0.02] px-4">
                  <InfoRow label="Phương thức" labelClassName="!text-cyan-300" value="Chuyển khoản QR" valueClassName="!text-white" />
                  <InfoRow label="Xử lý" labelClassName="!text-amber-300" value="Sau khi admin duyệt" valueClassName="!text-amber-100" />
                </div>

                <div className="mt-5 rounded-[18px] border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
                  <InfoRow label="Số tiền chọn" labelClassName="!text-violet-300" value={amount ? formatCurrency(Number(amount)) : '---'} valueClassName="!text-white" />
                  <InfoRow label="Trạng thái" labelClassName="!text-emerald-300" value="Chưa tạo yêu cầu" valueClassName="!text-emerald-200" />
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
                <div className="rounded-[22px] border border-cyan-400/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_42%),linear-gradient(180deg,rgba(9,14,30,0.94),rgba(8,13,28,0.98))] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/85">QR thanh toán</p>
                    <Badge variant="accent">VietQR</Badge>
                  </div>

                  <div className="grid place-items-center">
                    {request.qrImageUrl ? (
                      <img src={request.qrImageUrl} alt="Mã QR chuyển khoản VietQR" className="max-w-full rounded-[16px]" />
                    ) : (
                      <div className="grid place-items-center gap-2 py-8 text-center text-slate-400">
                        <QrCode size={26} />
                        <span>Không có mã QR</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-[22px] border border-white/[0.06] bg-white/[0.02] px-4 py-4 sm:px-5 sm:py-5">
                <div className="mb-3">
                  <h3 className="text-[1.05rem] font-black tracking-tight text-white">Thông tin chuyển khoản</h3>
                </div>

                <div className="grid gap-0 rounded-[18px] border border-white/[0.06] bg-white/[0.02] px-4">
                  <InfoRow label="Số tiền" labelClassName="!text-cyan-300" value={formatCurrency(request.amount)} valueClassName="!text-cyan-100 font-black" />
                  <InfoRow label="Ngân hàng" labelClassName="!text-amber-300" value={resolveBankDisplayName(request.bankId)} valueClassName="!text-white" />
                  <InfoRow label="Số tài khoản" labelClassName="!text-sky-300" value={request.accountNo || '---'} valueClassName="!text-white" />
                  <InfoRow label="Chủ tài khoản" labelClassName="!text-violet-300" value={request.accountName || '---'} valueClassName="!text-white" />
                  <InfoRow
                    label="Nội dung CK"
                    labelClassName="!text-emerald-300"
                    value={request.transferContent}
                    valueClassName="!text-cyan-50 font-black"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-white/[0.02] text-slate-200 hover:border-cyan-300/25 hover:bg-cyan-400/10 hover:text-cyan-50"
                    onClick={() => void handleCopy('content', request.transferContent)}
                  >
                    {copiedKey === 'content' ? <Check size={14} /> : <Copy size={14} />}
                    Copy nội dung
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-white/[0.02] text-slate-200 hover:border-cyan-300/25 hover:bg-cyan-400/10 hover:text-cyan-50"
                    onClick={() => void handleCopy('account', request.accountNo)}
                  >
                    {copiedKey === 'account' ? <Check size={14} /> : <Copy size={14} />}
                    Copy STK
                  </Button>
                </div>

                <p className="mt-4 rounded-[16px] border border-amber-400/12 bg-amber-400/8 p-4 text-sm leading-6 text-amber-100/90">
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
              <div className="mx-auto grid size-16 place-items-center rounded-[22px] border border-emerald-400/16 bg-emerald-400/10 text-emerald-300">
                <CheckCircle2 size={34} />
              </div>

              <div className="space-y-2">
                <h3 className="text-[1.3rem] font-black tracking-tight text-white">Yêu cầu đã được gửi</h3>
                <p className="text-sm leading-6 text-slate-300">Admin sẽ kiểm tra và duyệt giao dịch.</p>
              </div>

              <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.02] px-4 text-left">
                <InfoRow label="Số tiền" labelClassName="!text-cyan-300" value={request ? formatCurrency(request.amount) : '---'} valueClassName="!text-white" />
                <InfoRow label="Mã yêu cầu" labelClassName="!text-violet-300" value={request?.code ?? '---'} valueClassName="!text-white" />
                <InfoRow label="Trạng thái" labelClassName="!text-emerald-300" value={status?.label ?? 'Chờ duyệt'} valueClassName="!text-emerald-200" />
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

function InfoRow({
  label,
  value,
  labelClassName,
  valueClassName,
}: {
  label: string;
  value: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-3.5 last:border-b-0">
      <span className={classNames('text-sm font-medium text-slate-400', labelClassName)}>{label}</span>
      <span className={classNames('text-right text-sm font-semibold text-white', valueClassName)}>{value}</span>
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
