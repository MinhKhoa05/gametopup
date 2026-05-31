import { FormEvent, useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  History,
  QrCode,
  Send,
  ShieldCheck,
  WalletCards,
  XCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/format';
import { DepositRequest, User, WalletInfo, WalletTransaction } from '../types';
import { Route } from '../lib/routes';

const quickAmounts = [50000, 100000, 200000, 500000];
const bankNames: Record<string, string> = {
  acb: 'ACB',
  bidv: 'BIDV',
  mbbank: 'MB Bank',
  mb: 'MB Bank',
  tcb: 'Techcombank',
  techcombank: 'Techcombank',
  vcb: 'Vietcombank',
  vietcombank: 'Vietcombank',
  vietinbank: 'VietinBank',
  vtb: 'VietinBank',
  vpbank: 'VPBank',
};
const transactionFilters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Nạp tiền', value: 'deposit' },
  { label: 'Rút tiền', value: 'withdraw' },
  { label: 'Thanh toán', value: 'paid' },
  { label: 'Hoàn tiền', value: 'refund' },
] as const;

type WalletView = 'overview' | 'deposit';
type TransactionFilter = (typeof transactionFilters)[number]['value'];

export function WalletPage({
  user,
  wallet,
  amount,
  setAmount,
  deposit,
  clearDeposit,
  depositRequests,
  depositRequestsLoading,
  transactions,
  transactionsLoading,
  busy,
  onSubmit,
  onConfirm,
  navigate,
}: {
  user: User | null;
  wallet: WalletInfo | null;
  amount: number;
  setAmount: (val: number) => void;
  deposit: DepositRequest | null;
  clearDeposit: () => void;
  depositRequests: DepositRequest[];
  depositRequestsLoading: boolean;
  transactions: WalletTransaction[];
  transactionsLoading: boolean;
  busy: boolean;
  onSubmit: (e: FormEvent) => void;
  onConfirm: () => void;
  navigate: (route: Route) => void;
}) {
  const [view, setView] = useState<WalletView>('overview');
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const filteredTransactions = useMemo(
    () => transactions.filter((item) => filter === 'all' || getTransactionGroup(item.type) === filter),
    [filter, transactions],
  );

  if (!user) {
    return (
      <div className="empty-state max-w-lg mx-auto mt-12">
        <WalletCards size={48} className="mx-auto mb-4 text-slate-400" />
        <h2 className="text-xl text-white font-bold mb-2">Bạn chưa đăng nhập</h2>
        <p className="mb-6">Vui lòng đăng nhập để quản lý ví và nạp tiền.</p>
        <button className="btn-primary" onClick={() => navigate({ name: 'account' })}>Đăng nhập ngay</button>
      </div>
    );
  }

  if (view === 'deposit' || deposit) {
    return (
      <div className="wallet-page">
        <button
          className="wallet-back-button"
          type="button"
          onClick={() => {
            clearDeposit();
            setView('overview');
          }}
        >
          <ArrowLeft size={16} />
          Quay lại ví
        </button>

        <section className="wallet-balance">
          <div>
            <p className="eyebrow">Nạp ví</p>
            <h1>Nạp số dư ví</h1>
            <p>Quét mã VietQR, chuyển đúng nội dung và xác nhận để hệ thống ghi nhận yêu cầu.</p>
          </div>
          <div className="wallet-balance-card">
            <span>Số dư khả dụng</span>
            <strong>{formatCurrency(wallet?.balance || 0)}</strong>
          </div>
        </section>

        <div className="wallet-layout">
          <main className="wallet-main">
            {!deposit ? (
              <DepositAmountForm amount={amount} busy={busy} onSubmit={onSubmit} setAmount={setAmount} />
            ) : (
              <DepositQrPanel deposit={deposit} busy={busy} onConfirm={onConfirm} />
            )}
          </main>

          <WalletNotes />
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <section className="wallet-dashboard-hero">
        <div>
          <p className="eyebrow">Ví GameTopUp</p>
          <h1>Quản lý số dư</h1>
          <p>Theo dõi biến động ví, nạp tiền và xem lịch sử giao dịch của tài khoản.</p>
        </div>
        <div className="wallet-balance-card">
          <span>Số dư khả dụng</span>
          <strong>{formatCurrency(wallet?.balance || 0)}</strong>
        </div>
      </section>

      <div className="wallet-actions">
        <button type="button" className="wallet-action-card primary" onClick={() => setView('deposit')}>
          <span><ArrowDownLeft size={22} /></span>
          <div>
            <strong>Nạp tiền</strong>
            <small>Tạo mã QR chuyển khoản VietQR.</small>
          </div>
          <ArrowRight size={18} />
        </button>

        <button type="button" className="wallet-action-card" disabled title="Chức năng rút tiền chưa hỗ trợ">
          <span><ArrowUpRight size={22} /></span>
          <div>
            <strong>Rút tiền</strong>
            <small>Chức năng đang được phát triển.</small>
          </div>
        </button>
      </div>

      <DepositRequestList loading={depositRequestsLoading} requests={depositRequests} onCreate={() => setView('deposit')} />

      <section className="wallet-panel wallet-history">
        <div className="wallet-history-heading">
          <div>
            <h2>Lịch sử ví</h2>
            <p>Phân loại giao dịch nạp, rút, thanh toán và hoàn tiền.</p>
          </div>
          <History size={22} />
        </div>

        <div className="wallet-filter-tabs">
          {transactionFilters.map((item) => (
            <button
              key={item.value}
              type="button"
              className={filter === item.value ? 'active' : ''}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <WalletTransactionList loading={transactionsLoading} transactions={filteredTransactions} />
      </section>
    </div>
  );
}

function DepositRequestList({
  loading,
  requests,
  onCreate,
}: {
  loading: boolean;
  requests: DepositRequest[];
  onCreate: () => void;
}) {
  const recentRequests = requests.slice(0, 4);

  return (
    <section className="wallet-panel wallet-requests">
      <div className="wallet-history-heading">
        <div>
          <h2>Yêu cầu nạp gần đây</h2>
          <p>Theo dõi các yêu cầu đã gửi và trạng thái admin duyệt.</p>
        </div>
        <Send size={22} />
      </div>

      {loading ? (
        <div className="wallet-history-empty">Đang tải yêu cầu nạp...</div>
      ) : recentRequests.length === 0 ? (
        <div className="wallet-request-empty">
          <span>Chưa có yêu cầu nạp nào.</span>
          <button type="button" onClick={onCreate}>Tạo yêu cầu nạp</button>
        </div>
      ) : (
        <div className="wallet-request-list">
          {recentRequests.map((request) => {
            const status = getDepositRequestStatus(request.status);

            return (
              <div className="wallet-request-row" key={request.id}>
                <div className={`wallet-request-icon ${status.tone}`}>{status.icon}</div>
                <div className="wallet-request-main">
                  <strong>{formatCurrency(request.amount)}</strong>
                  <span>{request.transferContent}</span>
                  <small>{formatDate(request.createdAt)}</small>
                </div>
                <div className={`wallet-request-status ${status.tone}`}>
                  <b>{status.label}</b>
                  <span>{status.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DepositAmountForm({
  amount,
  busy,
  onSubmit,
  setAmount,
}: {
  amount: number;
  busy: boolean;
  onSubmit: (event: FormEvent) => void;
  setAmount: (value: number) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="wallet-panel wallet-deposit-form">
      <div className="wallet-panel-heading">
        <div className="wallet-icon"><WalletCards size={22} /></div>
        <div>
          <h2>Tạo lệnh nạp</h2>
          <p>Chọn số tiền muốn nạp vào ví của bạn.</p>
        </div>
      </div>

      <label className="wallet-amount-field">
        <span>Số tiền cần nạp</span>
        <input
          type="number"
          value={amount}
          onChange={(event) => setAmount(Number(event.target.value))}
          min={10000}
          step={10000}
        />
      </label>

      <div className="wallet-quick-amounts" aria-label="Chọn nhanh số tiền nạp">
        {quickAmounts.map((value) => (
          <button
            key={value}
            type="button"
            className={amount === value ? 'active' : ''}
            onClick={() => setAmount(value)}
          >
            {formatCurrency(value)}
          </button>
        ))}
      </div>

      <button type="submit" className="btn-primary w-full text-lg" disabled={amount < 10000 || busy}>
        Tạo lệnh nạp <ArrowRight size={20} />
      </button>
    </form>
  );
}

function WalletNotes() {
  return (
    <aside className="wallet-side">
      <div className="wallet-panel wallet-note">
        <h3>Lưu ý khi nạp tiền</h3>
        <ul>
          <li>Nội dung chuyển khoản phải chính xác như hệ thống cung cấp.</li>
          <li>Mã QR đã bao gồm số tiền và nội dung nạp.</li>
          <li>Sau khi chuyển khoản, hãy nhấn “Xác nhận đã chuyển khoản” để gửi yêu cầu duyệt.</li>
          <li>Yêu cầu nạp tiền sẽ ở trạng thái chờ admin kiểm tra.</li>
          <li>Thời gian kiểm tra thường khoảng 10-15 phút, có thể lâu hơn tùy tình trạng giao dịch.</li>
          <li>Số dư chỉ được cộng sau khi admin xác nhận giao dịch thành công.</li>
        </ul>
      </div>

      <div className="wallet-panel wallet-safe">
        <ShieldCheck size={24} />
        <div>
          <strong>Không tự sửa nội dung chuyển khoản</strong>
          <span>Hệ thống đối soát theo mã nạp riêng của từng yêu cầu.</span>
        </div>
      </div>
    </aside>
  );
}

function DepositQrPanel({
  deposit,
  busy,
  onConfirm,
}: {
  deposit: DepositRequest;
  busy: boolean;
  onConfirm: () => void;
}) {
  const bankCode = deposit.bankId?.trim().toLowerCase() || '';
  const bankName = bankNames[bankCode] ?? deposit.bankId?.toUpperCase() ?? 'Ngân hàng';
  const accountNo = deposit.accountNo || '--';
  const accountName = deposit.accountName || '--';

  return (
    <div className="wallet-panel wallet-qr-panel">
      <div className="wallet-panel-heading">
        <div className="wallet-icon"><QrCode size={22} /></div>
        <div>
          <h2>Thanh toán bằng VietQR</h2>
          <p>Mở ứng dụng ngân hàng, quét mã và kiểm tra thông tin trước khi chuyển.</p>
        </div>
      </div>

      <div className="wallet-qr-content">
        <div className="wallet-qr-box">
          <img src={deposit.qrImageUrl} alt="Mã QR chuyển khoản VietQR" />
        </div>

        <div className="wallet-transfer-card">
          <InfoRow label="Số tiền" value={formatCurrency(deposit.amount)} highlight />
          <InfoRow label="Ngân hàng" value={bankName} />
          <InfoRow label="Số tài khoản" value={accountNo} copyValue={accountNo} />
          <InfoRow label="Chủ tài khoản" value={accountName} />
          <InfoRow label="Nội dung nạp" value={deposit.transferContent} copyValue={deposit.transferContent} code />
        </div>
      </div>

      <div className="wallet-confirm-strip">
        <CheckCircle2 size={20} />
        <span>Chỉ xác nhận sau khi bạn đã chuyển khoản thành công.</span>
      </div>

      <button className="btn-primary w-full text-lg h-14" onClick={onConfirm} disabled={busy}>
        Xác nhận đã chuyển khoản
      </button>
    </div>
  );
}

function WalletTransactionList({
  loading,
  transactions,
}: {
  loading: boolean;
  transactions: WalletTransaction[];
}) {
  if (loading) {
    return <div className="wallet-history-empty">Đang tải lịch sử ví...</div>;
  }

  if (transactions.length === 0) {
    return <div className="wallet-history-empty">Chưa có giao dịch phù hợp.</div>;
  }

  return (
    <div className="wallet-transaction-list">
      {transactions.map((item) => (
        <div className="wallet-transaction-row" key={item.id}>
          <div className={`wallet-transaction-icon ${getTransactionGroup(item.type)}`}>
            {getTransactionIcon(item.type)}
          </div>
          <div className="wallet-transaction-main">
            <strong>{getTransactionLabel(item.type)}</strong>
            <span>{item.description || `Giao dịch ví #${item.id}`}</span>
            <small>{formatDate(item.createdAt)}</small>
          </div>
          <div className="wallet-transaction-amount">
            <strong className={isDecreaseTransaction(item.type) ? 'negative' : 'positive'}>
              {isDecreaseTransaction(item.type) ? '-' : '+'}{formatCurrency(item.amount)}
            </strong>
            <span>Còn lại {formatCurrency(item.balanceAfter)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoRow({
  label,
  value,
  copyValue,
  highlight = false,
  code = false,
}: {
  label: string;
  value: string;
  copyValue?: string;
  highlight?: boolean;
  code?: boolean;
}) {
  return (
    <div className="wallet-info-row">
      <span>{label}</span>
      <div>
        <strong className={`${highlight ? 'highlight' : ''} ${code ? 'code' : ''}`}>{value}</strong>
        {copyValue && (
          <button type="button" aria-label={`Sao chép ${label}`} onClick={() => navigator.clipboard?.writeText(copyValue)}>
            <Copy size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

function getTransactionGroup(type: number): TransactionFilter {
  if (type === 1) return 'deposit';
  if (type === 2) return 'withdraw';
  if (type === 3) return 'paid';
  if (type === 4) return 'refund';
  return 'all';
}

function getTransactionLabel(type: number) {
  if (type === 1) return 'Nạp tiền';
  if (type === 2) return 'Rút tiền';
  if (type === 3) return 'Thanh toán đơn hàng';
  if (type === 4) return 'Hoàn tiền';
  return `Giao dịch loại ${type}`;
}

function getTransactionIcon(type: number) {
  if (type === 1 || type === 4) return <ArrowDownLeft size={18} />;
  if (type === 2 || type === 3) return <ArrowUpRight size={18} />;
  return <CreditCard size={18} />;
}

function isDecreaseTransaction(type: number) {
  return type === 2 || type === 3;
}

function getDepositRequestStatus(status: number) {
  if (status === 1) {
    return {
      label: 'Chờ chuyển khoản',
      description: 'Bạn cần chuyển khoản và xác nhận.',
      tone: 'pending',
      icon: <Clock3 size={18} />,
    };
  }

  if (status === 2) {
    return {
      label: 'Đã gửi, chờ duyệt',
      description: 'Admin kiểm tra khoảng 10-15 phút.',
      tone: 'reviewing',
      icon: <Send size={18} />,
    };
  }

  if (status === 3) {
    return {
      label: 'Đã duyệt',
      description: 'Số dư đã được cộng vào ví.',
      tone: 'approved',
      icon: <CheckCircle2 size={18} />,
    };
  }

  if (status === 4) {
    return {
      label: 'Đã từ chối',
      description: 'Vui lòng kiểm tra lại thông tin.',
      tone: 'rejected',
      icon: <XCircle size={18} />,
    };
  }

  return {
    label: `Trạng thái ${status}`,
    description: 'Đang cập nhật thông tin.',
    tone: 'pending',
    icon: <Clock3 size={18} />,
  };
}
