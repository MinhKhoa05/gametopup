import { useEffect, useState } from 'react';
import { getApiMessage } from '../../../lib/api';
import { DepositRequest, User } from '../../../types';
import { getMyDepositRequests } from '../services/walletService';

export function useDepositRequests(user: User | null, setError: (message: string | null) => void) {
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [depositRequestsLoading, setDepositRequestsLoading] = useState(false);

  async function refreshDepositRequests() {
    if (!user) {
      setDepositRequests([]);
      return;
    }

    setDepositRequestsLoading(true);
    setError(null);

    try {
      const data = await getMyDepositRequests();
      setDepositRequests(data);
    } catch (err) {
      setError(getApiMessage(err));
    } finally {
      setDepositRequestsLoading(false);
    }
  }

  useEffect(() => {
    refreshDepositRequests().catch(() => undefined);
  }, [user]);

  return {
    depositRequests,
    depositRequestsLoading,
    refreshDepositRequests,
  };
}
