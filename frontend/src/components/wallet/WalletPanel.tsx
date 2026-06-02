import { FormEvent } from 'react';
import { CheckCircle2, CreditCard, QrCode, UserRound, WalletCards } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import { Route } from '../../lib/routes';
import { DepositRequest, User, WalletInfo } from '../../types';
import { Badge } from '../common/Badge';
import { Field } from '../common/Field';
import { IconBox } from '../common/IconBox';
import { SectionHeading } from '../common/SectionHeading';
import { classNames } from '../../lib/ui';

const quickAmounts = [100000, 200000, 500000, 1000000];

export function WalletPanel({
  user,
  wallet,
  amount,
  setAmount,
  deposit,
  busy,
  onSubmit,
  onConfirm,
  navigate,
}: {
  user: User | null;
  wallet: WalletInfo | null;
  amount: number;
  setAmount: (amount: number) => void;
  deposit: DepositRequest | null;
  busy: boolean;
  onSubmit: (event: FormEvent) => void;
  onConfirm: () => void;
  navigate: (route: Route) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/6 bg-ink-light p-6">
      <SectionHeading
        eyebrow="Ví"
        title={deposit ? 'Thanh toán bằng VietQR' : 'Nạp tiền VietQR'}
        description={
          deposit
            ? 'Quét mã, chuyển đúng nội dung và xác nhận khi giao dịch đã hoàn tất.'
            : 'Chọn số tiền muốn nạp vào ví của bạn.'
        }
        action={<Badge tone="info">{formatCurrency(wallet?.balance ?? 0)}</Badge>}
      />

      {!user ? (
        <button
          type="button"
          className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-slate-200 transition-colors hover:border-cyanline/30 hover:bg-cyan-400/8"
          onClick={() => navigate({ name: 'account' })}
        >
          <IconBox size="sm">
            <UserRound size={18} />
          </IconBox>
          <span className="font-semibold">Đăng nhập để nạp ví</span>
        </button>
      ) : null}

      {!deposit ? (
        <form className={classNames('mt-5 grid gap-4', !user && 'pointer-events-none opacity-60')} onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Chọn nhanh số tiền nạp">
            {quickAmounts.map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setAmount(value)}
                className={classNames(
                  'rounded-xl border px-3 py-3 text-sm font-bold transition-colors',
                  amount === value
                    ? 'border-cyanline bg-cyanline/15 text-cyan-100'
                    : 'border-white/10 bg-white/4 text-slate-300 hover:border-cyanline/30 hover:bg-white/8',
                )}
              >
                {formatCurrency(value)}
              </button>
            ))}
          </div>

          <Field
            label="Số tiền"
            value={String(amount)}
            onChange={(value) => setAmount(Number(value) || 0)}
            type="number"
            placeholder="200000"
          />

          <button className="btn-primary w-full text-lg" type="submit" disabled={!user || busy}>
            <CreditCard size={18} />
            Tạo yêu cầu nạp
          </button>
        </form>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4">
            {deposit.qrImageUrl ? (
              <img src={deposit.qrImageUrl} alt="Mã QR chuyển khoản VietQR" />
            ) : (
              <div className="grid place-items-center gap-2 py-8 text-center text-slate-400">
                <IconBox size="lg">
                  <QrCode size={24} />
                </IconBox>
                <span>Không có mã QR</span>
              </div>
            )}
          </div>

          <div className="grid gap-2 rounded-2xl border border-white/6 bg-white/3 p-4">
            <InfoRow label="Số tiền" value={formatCurrency(deposit.amount)} highlight />
            <InfoRow label="Mã yêu cầu" value={deposit.code} code />
            <InfoRow label="Nội dung nạp" value={deposit.transferContent} code />
            <button className="btn-primary mt-2 h-12 w-full text-base" type="button" onClick={onConfirm} disabled={busy}>
              <CheckCircle2 size={18} />
              Xác nhận đã chuyển khoản
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
  code = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  code?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/6 bg-slate-950/35 px-4 py-3">
      <span className="text-sm font-semibold text-slate-400">{label}</span>
      <strong
        className={classNames(
          'max-w-[220px] overflow-hidden text-ellipsis text-right text-sm font-black',
          highlight ? 'text-cyan-100' : 'text-white',
          code ? 'font-mono tracking-tight' : '',
        )}
      >
        {value}
      </strong>
    </div>
  );
}
