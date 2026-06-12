import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, History, ShieldCheck, WalletCards } from 'lucide-react';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import {
  useConfirmDepositTransferMutation,
  useCreateDepositRequestMutation,
  useMyDepositRequestsQuery,
  useWalletBalanceQuery,
  useWalletTransactionsQuery,
} from '@/features/wallet/server';
import { Badge, Button, EmptyState, IconBox, SectionHeading, StatCard } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import {
  WalletDepositFlowPanel,
  WalletDepositRequestHistory,
  WalletTransactionHistory,
} from '@/features/wallet/components';
import type { WalletTransactionType } from '@/features/wallet/types';
import { routes } from '@/app/router/routes';

const WALLET_TRANSACTION_FILTER_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Nạp tiền', value: 'deposit' },
  { label: 'Rút tiền', value: 'withdraw' },
  { label: 'Thanh toán', value: 'paid' },
  { label: 'Hoàn tiền', value: 'refund' },
] as const;

const WALLET_OVERVIEW_HERO_CLASS_NAME =
  'grid gap-4 rounded-2xl border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(207,250,254,0.34),transparent_34%),linear-gradient(135deg,var(--gt-hero-start),var(--gt-hero-end))] p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center';

const WALLET_DEPOSIT_NOTICE = {
  title: 'Không thay đổi thông tin chuyển khoản',
  description: 'Hệ thống đối soát theo mã nạp riêng của từng yêu cầu.',
} as const;

function matchesWalletTransactionFilter(
  type: WalletTransactionType,
  filter: (typeof WALLET_TRANSACTION_FILTER_OPTIONS)[number]['value'],
) {
  if (filter === 'all') return true;
  if (filter === 'deposit') return type === 1;
  if (filter === 'withdraw') return type === 2;
  if (filter === 'paid') return type === 3;
  if (filter === 'refund') return type === 4;
  return true;
}

export function WalletPage() {
  const navigate = useNavigate();
  const auth = useAuthSession();
  const balanceQuery = useWalletBalanceQuery(auth.status === 'authenticated');
  const transactionsQuery = useWalletTransactionsQuery(auth.status === 'authenticated');
  const depositRequestsQuery = useMyDepositRequestsQuery(auth.status === 'authenticated');
  const createDepositRequestMutation = useCreateDepositRequestMutation();
  const confirmDepositTransferMutation = useConfirmDepositTransferMutation();
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [amount, setAmount] = useState('100000');
  const [filter, setFilter] = useState<(typeof WALLET_TRANSACTION_FILTER_OPTIONS)[number]['value']>('all');
  const [view, setView] = useState<'overview' | 'deposit'>('overview');

  const transactions = useMemo(() => {
    const source = transactionsQuery.data ?? [];
    return source.filter((transaction) => matchesWalletTransactionFilter(transaction.type, filter));
  }, [filter, transactionsQuery.data]);

  const activeRequest =
    depositRequestsQuery.data?.find((request) => request.id === activeRequestId) ?? depositRequestsQuery.data?.[0] ?? null;

  async function handleCreateDeposit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number.parseInt(amount, 10);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const request = await createDepositRequestMutation.mutateAsync({ amount: parsedAmount });
    setActiveRequestId(request.id);
    setView('deposit');
  }

  async function handleConfirmDeposit() {
    if (!activeRequest) {
      return;
    }

    const request = await confirmDepositTransferMutation.mutateAsync({ requestId: activeRequest.id });
    setActiveRequestId(request.id);
  }

  if (auth.status === 'checking' && !auth.user) {
    return <WalletLoading />;
  }

  if (!auth.user) {
    return (
      <EmptyState
        className="mx-auto mt-12 max-w-lg"
        icon={
          <IconBox className="mx-auto mb-4" size="lg">
            <WalletCards size={24} />
          </IconBox>
        }
        title="Bạn chưa đăng nhập"
        description="Vui lòng đăng nhập để quản lý ví và nạp tiền."
        actionLabel="Đăng nhập ngay"
        onAction={() => navigate(routes.auth())}
      />
    );
  }

  return (
    <AppPageContainer className="py-8">
      {view === 'deposit' ? (
        <div className="space-y-5">
          <Button
            className="border-cyan/25 bg-transparent text-cyan-50 hover:bg-cyan/10 hover:text-cyan-50"
            onClick={() => setView('overview')}
          >
            <ArrowLeft size={16} />
            Quay lại ví
          </Button>

          <section className="grid gap-4 rounded-2xl border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_32%),linear-gradient(135deg,var(--gt-hero-start),var(--gt-hero-end))] p-5 md:grid-cols-[minmax(0,1fr)_280px] md:items-center md:p-6">
            <div className="space-y-3">
              <Badge variant="accent" className="uppercase tracking-[0.18em]">
                Nạp ví VietQR
              </Badge>
              <div className="space-y-2">
                <h1 className="text-[clamp(2rem,4.2vw,3.1rem)] font-black leading-[0.95] tracking-tight text-white">
                  Nạp ví
                  <br />
                  <span className="text-cyan">nhanh, rõ và đúng chuẩn</span>
                </h1>
                <p className="max-w-2xl text-[0.95rem] leading-6 text-slate-300 sm:text-base">
                  Quét mã VietQR, chuyển đúng số tiền và nội dung để hệ thống tự động ghi nhận yêu cầu nạp của bạn.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge>VietQR tự động</Badge>
                <Badge>Đối soát theo mã nạp</Badge>
                <Badge>Cập nhật trạng thái tức thì</Badge>
              </div>
            </div>

            <div className="grid gap-3">
              <StatCard icon={<WalletCards size={20} />} label="Số dư khả dụng" value={formatCurrency(balanceQuery.data ?? 0)} />
              <div className="rounded-2xl border border-white/8 bg-slate-950/25 p-4 text-sm leading-6 text-slate-300">
                Mỗi yêu cầu nạp có mã riêng. Chỉ cần chuyển đúng nội dung là hệ thống sẽ nhận diện tự động.
              </div>
            </div>
          </section>

          <main className="min-w-0">
            <WalletDepositFlowPanel
              amount={amount}
              busy={createDepositRequestMutation.isPending || confirmDepositTransferMutation.isPending}
              confirmDepositPending={confirmDepositTransferMutation.isPending}
              createDepositPending={createDepositRequestMutation.isPending}
              deposit={activeRequest}
              onConfirm={handleConfirmDeposit}
              onSubmit={handleCreateDeposit}
              setAmount={setAmount}
              userDisplayName={auth.user.displayName ?? auth.user.email}
              walletBalance={balanceQuery.data ?? 0}
            />
          </main>

          <section className="gt-surface-ink rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <IconBox size="md" className="border border-cyan/15 bg-cyan/10 text-cyan-50">
                <ShieldCheck size={18} />
              </IconBox>
              <div>
                <p className="gt-eyebrow">Lưu ý khi nạp tiền</p>
                <h3 className="m-0 text-lg font-black text-white">Đọc nhanh trước khi chuyển khoản</h3>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <TipCard title="Chỉ đúng nội dung" description="Nhập đúng nội dung chuyển khoản được cấp." tone="cyan" />
              <TipCard title="Đúng số tiền" description="Chuyển đúng số tiền đang hiển thị." tone="emerald" />
              <TipCard title="Xác nhận sau khi chuyển" description="Bấm xác nhận khi giao dịch đã xong." tone="violet" />
              <TipCard title="Admin duyệt 10 - 15 phút" description="Số dư cập nhật sau khi duyệt." tone="amber" />
            </div>

            <section className="mt-4 rounded-2xl border border-cyan/15 bg-cyan/8 p-4 text-slate-300">
              <strong className="block text-white">{WALLET_DEPOSIT_NOTICE.title}</strong>
              <span className="mt-1 block text-sm leading-6">{WALLET_DEPOSIT_NOTICE.description}</span>
            </section>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          <section className={WALLET_OVERVIEW_HERO_CLASS_NAME}>
            <div className="space-y-3">
              <Badge variant="accent" className="uppercase tracking-[0.18em]">
                Ví {auth.user.displayName ?? auth.user.email}
              </Badge>
              <div className="space-y-2">
                <h1 className="text-[clamp(2rem,4.2vw,3.1rem)] font-black leading-[0.95] tracking-tight text-white">
                  Quản lý
                  <br />
                  <span className="text-cyan">số dư</span>
                </h1>
                <p className="max-w-2xl text-[0.95rem] leading-6 text-slate-300 sm:text-base">
                  Theo dõi biến động ví, nạp tiền và xem lịch sử giao dịch của tài khoản.
                </p>
              </div>

              <div className="flex flex-wrap gap-2" aria-label="Thông tin nhanh">
                <Badge>VietQR an toàn</Badge>
                <Badge>Cập nhật tức thì</Badge>
                <Badge>Lịch sử rõ ràng</Badge>
              </div>
            </div>
            <StatCard icon={<WalletCards size={20} />} label="Số dư khả dụng" value={formatCurrency(balanceQuery.data ?? 0)} />
          </section>

          <div className="grid gap-3 md:grid-cols-2">
            <Button
              className="min-h-24 justify-start rounded-2xl border border-white/8 bg-white/4 px-5 py-4 text-left text-white hover:border-cyan/20 hover:bg-white/6"
              onClick={() => setView('deposit')}
            >
              <div className="flex items-center gap-3">
                <IconBox size="sm">
                  <ArrowDownLeft size={18} />
                </IconBox>
                <div>
                  <strong className="block text-base font-black">Nạp tiền</strong>
                  <span className="block text-sm font-normal text-slate-300">Tạo mã QR chuyển khoản VietQR.</span>
                </div>
              </div>
            </Button>

            <Button className="min-h-24 justify-start rounded-2xl border border-white/8 bg-white/4 px-5 py-4 text-left text-white opacity-65" disabled>
              <div className="flex items-center gap-3">
                <IconBox size="sm">
                  <ArrowUpRight size={18} />
                </IconBox>
                <div>
                  <strong className="block text-base font-black">Rút tiền</strong>
                  <span className="block text-sm font-normal text-slate-300">Chức năng đang được phát triển.</span>
                </div>
              </div>
            </Button>
          </div>

          <WalletDepositRequestHistory
            loading={depositRequestsQuery.isPending}
            requests={depositRequestsQuery.data ?? []}
            onCreate={() => setView('deposit')}
          />

          <section className="gt-surface-ink rounded-2xl">
            <SectionHeading
              className="px-6 pt-6"
              title="Lịch sử ví"
              description="Phân loại giao dịch nạp, rút, thanh toán và hoàn tiền."
            />

            <div className="flex gap-2 overflow-x-auto px-6 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {WALLET_TRANSACTION_FILTER_OPTIONS.map((item) => (
                <Button
                  key={item.value}
                  variant={filter === item.value ? 'accent' : 'default'}
                  className="min-h-10 whitespace-nowrap rounded-full px-3.5 py-2 text-sm"
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <WalletTransactionHistory loading={transactionsQuery.isPending} transactions={transactions} />
          </section>
        </div>
      )}
    </AppPageContainer>
  );
}

function WalletLoading() {
  return (
    <AppPageContainer className="py-8" aria-busy="true">
      <div className="h-56 animate-pulse rounded-[28px] bg-white/5" />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-72 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-72 animate-pulse rounded-2xl bg-white/5" />
      </div>
    </AppPageContainer>
  );
}

function TipCard({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: 'cyan' | 'emerald' | 'violet' | 'amber';
}) {
  const toneClass =
    tone === 'emerald'
      ? 'border-emerald-400/15 bg-emerald-400/10 text-emerald-300'
      : tone === 'violet'
        ? 'border-violet-400/15 bg-violet-400/10 text-violet-300'
        : tone === 'amber'
          ? 'border-amber-400/15 bg-amber-400/10 text-amber-300'
          : 'border-cyan/15 bg-cyan/10 text-cyan-50';

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <strong className="block text-sm font-black text-white">{title}</strong>
      <p className="mt-1 text-sm leading-5 text-slate-300">{description}</p>
    </div>
  );
}
