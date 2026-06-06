import { FormEvent, useEffect, useState } from 'react';
import { Check, CheckCircle2, Copy, CreditCard, QrCode, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Field, IconBox, RecordRow, SectionHeading, StepProgress } from '../ui';
import { useRoute } from '../../hooks/common/route.hooks';
import { formatCurrency } from '../../lib/format';
import { classNames } from '../../lib/ui';
import { DepositRequest, User, WalletInfo } from '../../types';
import { QUICK_AMOUNTS } from './wallet-panel.data';

const WALLET_DEPOSIT_STEPS = [
  {
    icon: <QrCode size={16} />,
    title: 'Tạo yêu cầu',
  },
  {
    icon: <CreditCard size={16} />,
    title: 'Chuyển khoản',
  },
  {
    icon: <CheckCircle2 size={16} />,
    title: 'Xác nhận nạp',
  },
  {
    icon: <ShieldCheck size={16} />,
    title: 'Admin duyệt',
  },
] as const;

type WalletPanelProps = {
  user: User | null;
  wallet: WalletInfo | null;
  deposit: DepositRequest | null;
  depositState: {
    amount: number;
    busy: boolean;
    confirmDepositPending: boolean;
    createDepositPending: boolean;
    onConfirm: () => void;
    onSubmit: (event: FormEvent) => void;
    setAmount: (amount: number) => void;
  };
};

export function WalletPanel({ user, wallet, deposit, depositState }: WalletPanelProps) {
  const { navigate } = useRoute();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { amount, busy, confirmDepositPending, createDepositPending, onConfirm, onSubmit, setAmount } = depositState;
  const bankName = getBankDisplayName(deposit?.bankId);

  useEffect(() => {
    if (!copiedKey) return;

    const timer = window.setTimeout(() => setCopiedKey(null), 1400);
    return () => window.clearTimeout(timer);
  }, [copiedKey]);

  return (
    <div className="gt-surface-ink rounded-2xl p-6">
      <SectionHeading
        eyebrow="Ví"
        title={deposit ? 'Thanh toán bằng VietQR' : 'Nạp tiền VietQR'}
        description={deposit ? 'Quét mã, chuyển đúng nội dung và xác nhận khi giao dịch đã hoàn tất.' : 'Chọn số tiền muốn nạp vào ví của bạn.'}
        action={<Badge variant="accent">{formatCurrency(wallet?.balance ?? 0)}</Badge>}
      />

      {!user ? (
        <button
          type="button"
          className="gt-interactive mt-5 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-slate-200"
          onClick={() => navigate({ name: 'auth' })}
        >
          <IconBox size="sm">
            <UserRound size={18} />
          </IconBox>
          <span className="font-semibold">Đăng nhập để nạp ví</span>
        </button>
      ) : null}

      {!deposit ? (
        <div className="mt-5 grid gap-4">
          <StepProgress currentStep={1} steps={WALLET_DEPOSIT_STEPS} />

          <form className={classNames('grid gap-4', !user && 'pointer-events-none opacity-60')} onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Chọn nhanh số tiền nạp">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setAmount(value)}
                  className={classNames(
                    'gt-interactive rounded-xl border px-3 py-3 text-sm font-bold',
                    amount === value ? 'border-cyan bg-cyan/15 text-cyan-50' : 'border-white/10 bg-white/4 text-slate-300',
                  )}
                >
                  {formatCurrency(value)}
                </button>
              ))}
            </div>

            <Field
              label="Số tiền"
              value={String(amount)}
              onChange={(event) => setAmount(Number(event.target.value) || 0)}
              type="number"
              placeholder="200000"
            />

            <Button className="w-full text-lg" type="submit" variant="accent" disabled={!user || busy || createDepositPending}>
              <CreditCard size={18} />
              Tạo yêu cầu nạp
            </Button>
          </form>
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          <StepProgress currentStep={getDepositCurrentStep(deposit)} steps={WALLET_DEPOSIT_STEPS} />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
            <div className="overflow-hidden rounded-2xl border border-cyan/12 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_42%),linear-gradient(180deg,rgba(9,14,30,0.94),rgba(8,13,28,0.98))] p-4">
              <div className="mb-4">
                <p className="gt-eyebrow">Mã QR chuyển khoản</p>
              </div>

              <div className="grid place-items-center">
                {deposit.qrImageUrl ? (
                  <img src={deposit.qrImageUrl} alt="Mã QR chuyển khoản VietQR" className="max-w-full" />
                ) : (
                  <div className="grid place-items-center gap-2 py-8 text-center text-slate-400">
                    <IconBox size="lg">
                      <QrCode size={24} />
                    </IconBox>
                    <span>Không có mã QR</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="gt-eyebrow">Thông tin chuyển khoản</p>
                <Badge variant="accent">VietQR</Badge>
              </div>

              <div className="grid gap-2">
                <RecordRow className="grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] px-4 py-3">
                  <span className="text-sm font-semibold text-slate-400">Ngân hàng</span>
                  <div className="flex w-full items-center justify-end gap-2 text-right">
                    <BankLogoBadge bankId={deposit?.bankId} bankName={bankName} />
                    <CopyActionButton
                      copied={copiedKey === 'bank'}
                      label="Ngân hàng"
                      onCopy={async () => {
                        const copied = await copyValue(bankName);
                        if (copied) setCopiedKey('bank');
                      }}
                    />
                  </div>
                </RecordRow>

                <RecordRow className="grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] px-4 py-3">
                  <span className="text-sm font-semibold text-slate-400">Số tài khoản</span>
                  <div className="flex w-full items-center justify-end gap-2 text-right">
                    <strong className="font-mono text-right text-sm font-black tracking-tight text-white">{deposit.accountNo ?? '---'}</strong>
                    <CopyActionButton
                      copied={copiedKey === 'account'}
                      label="Số tài khoản"
                      onCopy={async () => {
                        const copied = await copyValue(deposit.accountNo ?? '');
                        if (copied) setCopiedKey('account');
                      }}
                    />
                  </div>
                </RecordRow>

                <RecordRow className="grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] px-4 py-3">
                  <span className="text-sm font-semibold text-slate-400">Người nhận</span>
                  <div className="flex w-full items-center justify-end gap-2 text-right">
                    <strong className="text-right text-sm font-black text-white">{deposit.accountName ?? '---'}</strong>
                    <CopyActionButton
                      copied={copiedKey === 'name'}
                      label="Người nhận"
                      onCopy={async () => {
                        const copied = await copyValue(deposit.accountName ?? '');
                        if (copied) setCopiedKey('name');
                      }}
                    />
                  </div>
                </RecordRow>

                <RecordRow highlighted className="grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] px-4 py-3">
                  <span className="text-sm font-semibold text-slate-400">Nội dung</span>
                  <div className="flex w-full items-center justify-end gap-2 text-right">
                    <strong className="max-w-[220px] truncate text-right font-mono text-sm font-black tracking-tight text-cyan-50">
                      {deposit.transferContent}
                    </strong>
                    <CopyActionButton
                      copied={copiedKey === 'content'}
                      label="Nội dung chuyển khoản"
                      onCopy={async () => {
                        const copied = await copyValue(deposit.transferContent);
                        if (copied) setCopiedKey('content');
                      }}
                    />
                  </div>
                </RecordRow>
              </div>

              <div className="mt-4 rounded-2xl border border-cyan/12 bg-cyan/8 p-4">
                <Button className="h-12 w-full text-base" variant="accent" onClick={onConfirm} disabled={busy || confirmDepositPending}>
                  <CheckCircle2 size={18} />
                  Xác nhận nạp
                </Button>
                <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                  Sau khi chuyển khoản xong, quay lại và bấm xác nhận để hệ thống ghi nhận yêu cầu.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CopyActionButton({
  copied,
  label,
  onCopy,
}: {
  copied: boolean;
  label: string;
  onCopy: () => Promise<void>;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={classNames(
        'size-8 shrink-0 border-white/10 bg-white/5 text-slate-200 hover:border-cyan/25 hover:bg-cyan/10 hover:text-cyan-50',
        copied && 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10 hover:text-emerald-100',
      )}
      aria-label={`Sao chép ${label}`}
      title={`Sao chép ${label}`}
      onClick={onCopy}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </Button>
  );
}

function getDepositCurrentStep(deposit: DepositRequest) {
  switch (deposit.status) {
    case 1:
      return 2;
    case 2:
      return 3;
    case 3:
      return 5;
    case 4:
      return 4;
    default:
      return 2;
  }
}

async function copyValue(value: string) {
  if (!value.trim()) {
    toast.error('Không có nội dung để sao chép.');
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    toast.success('Đã sao chép.');
    return true;
  } catch {
    toast.error('Không thể sao chép lúc này.');
    return false;
  }
}

function getBankDisplayName(bankId?: string): string {
  const normalized = bankId?.trim().toLowerCase();

  if (!normalized) {
    return 'Ngân hàng liên kết';
  }

  if (normalized === 'vcb' || normalized === 'vietcombank') {
    return 'Vietcombank';
  }

  return bankId ?? 'Ngân hàng liên kết';
}

function getBankLogoLabel(bankId?: string): string {
  const normalized = bankId?.trim().toLowerCase();

  if (!normalized) {
    return 'NH';
  }

  if (normalized === 'vcb' || normalized === 'vietcombank') {
    return 'VCB';
  }

  return normalized.slice(0, 3).toUpperCase();
}

function BankLogoBadge({ bankId, bankName }: { bankId?: string; bankName: string }) {
  const logoLabel = getBankLogoLabel(bankId);

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1">
      <span className="grid size-7 place-items-center rounded-full bg-emerald-400 text-[0.62rem] font-black leading-none text-slate-950">
        {logoLabel}
      </span>
      <strong className="text-right text-sm font-black text-white">{bankName}</strong>
    </span>
  );
}
