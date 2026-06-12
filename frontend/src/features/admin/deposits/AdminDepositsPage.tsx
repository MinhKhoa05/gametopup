import { useAdminDepositRequestsPageState, useAdminDepositRequestsSection } from './hooks';
import { DepositsAdminPanel } from '@/features/admin/deposits/components/DepositsAdminPanel';

export function AdminDepositsPage() {
  const section = useAdminDepositRequestsSection();
  const state = useAdminDepositRequestsPageState({
    onApproveRequest: section.approveRequest,
    onRejectRequest: section.rejectRequest,
    requests: section.requests,
  });

  return (
    <DepositsAdminPanel
      busy={section.busy}
      loading={section.loading}
      onApproveRequest={section.approveRequest}
      onRejectRequest={section.rejectRequest}
      requests={section.requests}
      state={state}
    />
  );
}
