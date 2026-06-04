import { AccountSummary } from './AccountSummary';
import { AccountQuickActions } from './AccountQuickActions';
import { AccountProfileForm } from './AccountProfileForm';
import { useProfileEditor } from '../../hooks/user.hooks';
import { useOrdersQuery } from '../../services/orders';
import { useWalletQuery } from '../../services/wallet';
import type { Route } from '../../lib/routes';
import type { User } from '../../types';

type AccountProfileSectionProps = {
  user: User;
  navigate: (route: Route) => void;
  onLogout: () => void;
};

export function AccountProfileSection({
  user,
  navigate,
  onLogout,
}: AccountProfileSectionProps) {
  const profileEditor = useProfileEditor({ user });

  return (
    <section className="grid gap-4 overflow-hidden rounded-[16px] border border-white/5 bg-ink-light p-0">
      <WalletSection user={user} />

      <div className="account-bottom-grid">
        <AccountQuickActions navigate={navigate} onLogout={onLogout} />

        <AccountProfileForm
          email={user.email}
          draftName={profileEditor.draftName}
          saveError={profileEditor.saveError}
          canSave={profileEditor.canSave}
          busy={profileEditor.isPending}
          onDraftNameChange={profileEditor.setDraftName}
          onSubmit={profileEditor.handleSubmit}
        />
      </div>
    </section>
  );
}

function WalletSection({ user }: { user: User }) {
  const isLoggedIn = Boolean(user);
  const walletQuery = useWalletQuery(isLoggedIn);
  const ordersQuery = useOrdersQuery(isLoggedIn);
  const isLoading = (walletQuery.isPending && !walletQuery.data) || (ordersQuery.isPending && !ordersQuery.data);

  if (isLoading) {
    return (
      <div className="account-summary-card">
        <div className="account-summary-top">
          <div className="account-profile-strip">
            <div className="account-avatar grid place-items-center">
              <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="grid min-w-0 gap-2">
              <div className="h-7 w-[min(100%,14rem)] animate-pulse rounded-full bg-white/8" />
              <div className="h-4 w-[min(100%,18rem)] animate-pulse rounded-full bg-white/6" />
              <div className="flex flex-wrap gap-2.5">
                <div className="h-6 w-32 animate-pulse rounded-full bg-white/8" />
                <div className="h-6 w-28 animate-pulse rounded-full bg-white/8" />
              </div>
              <div className="text-sm text-slate-400">Đang tải tài khoản...</div>
            </div>
          </div>

          <div className="account-summary-divider" />

          <div className="account-summary-metrics">
            <div className="h-24 w-full animate-pulse rounded-2xl bg-white/6 md:min-w-[240px]" />
            <div className="account-summary-separator" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-white/6 md:min-w-[240px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AccountSummary
      user={user}
      wallet={walletQuery.data ?? null}
      ordersCount={ordersQuery.data?.length ?? 0}
    />
  );
}
