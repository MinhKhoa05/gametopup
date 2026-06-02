import { FormEvent } from 'react';
import { CheckCircle2, CreditCard, UserRound } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import { Route } from '../../lib/routes';
import { classNames } from '../../lib/ui';
import { DepositRequest, User, WalletInfo } from '../../types';
import { Field } from '../common/Field';
import { SectionHeading } from '../common/SectionHeading';

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
    <div className="section-panel">
      <SectionHeading>
        <div className="section-heading__copy">
          <p className="eyebrow section-heading__eyebrow">Ví</p>
          <h2 className="section-heading__title">Nạp tiền VietQR</h2>
        </div>
        <span className="pill">{formatCurrency(wallet?.balance ?? 0)}</span>
      </SectionHeading>
      {!user && (
        <button type="button" className="secondary-button mb-4" onClick={() => navigate({ name: 'account' })}>
          <UserRound size={18} />
          Đăng nhập để nạp ví
        </button>
      )}
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="amount-grid">
          {quickAmounts.map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setAmount(value)}
              className={classNames('amount-button', amount === value && 'amount-button-active')}
            >
              {formatCurrency(value)}
            </button>
          ))}
        </div>
        <Field label="Số tiền" value={String(amount)} onChange={(value) => setAmount(Number(value) || 0)} type="number" placeholder="200000" />
        <button className="secondary-button w-full" type="submit" disabled={!user || busy}>
          <CreditCard size={18} />
          Tạo yêu cầu nạp
        </button>
      </form>
      {deposit && (
        <div className="deposit-box">
          {deposit.qrImageUrl && <img src={deposit.qrImageUrl} alt="VietQR" />}
          <div>
            <p className="text-sm text-slate-400">Nội dung chuyển khoản</p>
            <strong className="mt-1 block text-lg text-white">{deposit.transferContent}</strong>
            <p className="mt-2 text-sm text-slate-300">
              Mã {deposit.code} - {formatCurrency(deposit.amount)}
            </p>
            <button className="primary-button mt-4" type="button" onClick={onConfirm} disabled={busy}>
              <CheckCircle2 size={18} />
              Đã chuyển khoản
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
