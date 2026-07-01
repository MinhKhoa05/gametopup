import { useState } from 'react';
import type { AdminDepositFilter } from './api';
import { useAdminDepositRequestsPageState, useAdminDepositRequestsSection } from './hooks';
import { DepositsAdminPanel } from './components/DepositsAdminPanel';

export function AdminDepositsPage() {
  const [filter, setFilter] = useState<AdminDepositFilter>('active');
  const section = useAdminDepositRequestsSection(filter);
  const state = useAdminDepositRequestsPageState({
    filter,
    onApproveRequest: section.approveRequest,
    onRejectRequest: section.rejectRequest,
    requests: section.requests,
    setFilter,
  });

  return (
    <DepositsAdminPanel
      busy={section.busy}
      hasMore={section.hasMore}
      isLoadingMore={section.isLoadingMore}
      loading={section.loading}
      onLoadMore={section.loadMore}
      requests={section.requests}
      state={state}
    />
  );
}
