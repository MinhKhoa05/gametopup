import { useEffect, useState } from 'react';
import { getApiMessage } from '../../../lib/api';
import { User, WalletTransaction } from '../../../types';
import { getWalletTransactions } from '../services/walletService';

export function useWalletTransactions(user: User | null, setError: (message: string | null) => void) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  async function refreshTransactions() {
    if (!user) {
      setTransactions([]);
      return;
    }

    setTransactionsLoading(true);
    setError(null);

    try {
      const data = await getWalletTransactions();
      setTransactions(data);
    } catch (err) {
      setError(getApiMessage(err));
    } finally {
      setTransactionsLoading(false);
    }
  }

  useEffect(() => {
    refreshTransactions().catch(() => undefined);
  }, [user]);

  return {
    refreshTransactions,
    transactions,
    transactionsLoading,
  };
}
