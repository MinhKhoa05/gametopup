import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/app/router/routes';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useWalletOverviewQuery } from '@/features/wallet/server';
import {
  WALLET_HISTORY_PAGE_SIZE,
  type WalletHistoryFilters,
  type WalletHistoryView,
  buildWalletHistoryRows,
  getBankOptions,
  matchesTimeFilter,
  sortWalletHistoryRows,
} from '@/features/wallet/components/WalletHistoryPanel';

export function useWalletPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthSession();
  const overviewQuery = useWalletOverviewQuery(isAuthenticated);

  const [historyView, setHistoryView] = useState<WalletHistoryView>('deposit');
  const [historyPage, setHistoryPage] = useState(1);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [historyFilters, setHistoryFilters] = useState<WalletHistoryFilters>({
    search: '',
    bank: 'all',
    sort: 'newest',
    time: 'all',
    status: 'active',
  });

  const balance = overviewQuery.data?.balance ?? 0;
  const transactions = overviewQuery.data?.transactions ?? [];
  const depositRequests = overviewQuery.data?.depositRequests ?? [];

  useEffect(() => {
    setHistoryPage(1);
  }, [historyFilters, historyView]);

  useEffect(() => {
    setHistoryFilters((current) => ({ ...current, bank: 'all', status: historyView === 'deposit' ? 'active' : 'all' }));
  }, [historyView]);

  const historyRows = useMemo(() => buildWalletHistoryRows(depositRequests, transactions), [depositRequests, transactions]);

  const filteredHistoryRows = useMemo(() => {
    const keyword = historyFilters.search.trim().toLowerCase();

    const filtered = historyRows.filter((row) => {
      if (historyView === 'deposit' && row.kind !== 'deposit') return false;
      if (historyView === 'ledger' && row.kind !== 'ledger') return false;

      if (historyFilters.bank !== 'all') {
        if (historyView === 'deposit' && row.kind === 'deposit' && row.bankId !== historyFilters.bank) return false;
        if (historyView === 'ledger' && row.kind === 'ledger' && row.statusFilter !== historyFilters.bank) return false;
      }
      if (historyFilters.status === 'active' && row.kind === 'deposit' && row.statusFilter === 'success') return false;
      if (historyFilters.status !== 'active' && historyFilters.status !== 'all' && row.statusFilter !== historyFilters.status) return false;
      if (historyFilters.time !== 'all' && !matchesTimeFilter(row.createdAt, historyFilters.time)) return false;
      if (!keyword) return true;
      return row.searchText.includes(keyword);
    });

    return sortWalletHistoryRows(filtered, historyFilters.sort);
  }, [historyFilters.bank, historyFilters.search, historyFilters.sort, historyFilters.status, historyFilters.time, historyRows, historyView]);

  const historyTotalPages = Math.max(1, Math.ceil(filteredHistoryRows.length / WALLET_HISTORY_PAGE_SIZE));
  const currentHistoryPage = Math.min(historyPage, historyTotalPages);
  const historyPageRows = filteredHistoryRows.slice((currentHistoryPage - 1) * WALLET_HISTORY_PAGE_SIZE, currentHistoryPage * WALLET_HISTORY_PAGE_SIZE);

  const stats = useMemo(() => {
    const topupAmount = transactions.reduce((sum, transaction) => (transaction.type === 1 ? sum + transaction.amount : sum), 0);
    return {
      balance,
      topupAmount,
      requests: depositRequests.length,
      transactions: transactions.length,
    };
  }, [balance, depositRequests.length, transactions]);

  return {
    bankOptions: getBankOptions(depositRequests),
    currentHistoryPage,
    historyFilters,
    historyPageRows,
    historyTotalPages,
    historyView,
    isDepositOpen,
    navigateToLogin: () => navigate(routes.login()),
    setHistoryFilters,
    setHistoryPage,
    setHistoryView,
    setIsDepositOpen,
    stats,
  };
}
