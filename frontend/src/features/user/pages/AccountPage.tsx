import { AccountProfileForm, AccountQuickActions, AccountSummary, AccountSummarySkeleton } from '@/features/user/components';
import { useAuthSession } from '@/features/auth/hooks/auth.hooks';
import { useOrdersQuery } from '@/features/orders/api/orders';
import { useProfileEditor } from '@/features/user/hooks/user.hooks';
import { useWalletQuery } from '@/features/wallet/api/wallet';
import type { User } from '@/features/user/user.types';

export function AccountPage() {
  const { authStatus, handleLogout, user } = useAuthSession();

  if (authStatus === 'checking' && !user) {
    return <AccountPageLoading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-3.5">
      <header className="grid items-end gap-2">
        <div className="grid gap-1.5">
          <h1 className="m-0 text-[clamp(1.9rem,2.7vw,2.75rem)] font-black leading-none text-white">Tài khoản của tôi</h1>
          <p className="m-0 max-w-2xl text-sm leading-6 text-slate-400">
            Quản lý thông tin tài khoản và theo dõi nhanh các hoạt động của bạn.
          </p>
        </div>
      </header>

      <AccountProfileSection user={user} onLogout={handleLogout} />
    </div>
  );
}

function AccountProfileSection({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const profileEditor = useProfileEditor({ user });
  const walletQuery = useWalletQuery(true);
  const ordersQuery = useOrdersQuery(true);
  const isLoading = (walletQuery.isPending && !walletQuery.data) || (ordersQuery.isPending && !ordersQuery.data);

  return (
    <section className="gt-surface-ink grid gap-4 overflow-hidden rounded-2xl p-0">
      {isLoading ? (
        <AccountSummarySkeleton />
      ) : (
        <AccountSummary
          user={user}
          wallet={walletQuery.data ?? null}
          ordersCount={ordersQuery.data?.length ?? 0}
        />
      )}

      <div className="grid grid-cols-1 items-stretch gap-4 px-4 pb-4 md:px-5 md:pb-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:px-6 lg:pb-6">
        <AccountQuickActions onLogout={onLogout} />

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

function AccountPageLoading() {
  return (
    <div className="mx-auto grid max-w-7xl gap-3.5" aria-busy="true" aria-label="Đang xác thực tài khoản">
      <header className="grid items-end gap-2">
        <div className="grid gap-1.5">
          <div className="h-12 w-full max-w-72 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-5 w-full max-w-72 animate-pulse rounded-full bg-white/5" />
        </div>
      </header>

      <section className="gt-surface-ink grid gap-4 overflow-hidden rounded-2xl p-0">
        <AccountSummarySkeleton />

        <div className="grid grid-cols-1 items-stretch gap-4 px-4 pb-4 md:px-5 md:pb-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:px-6 lg:pb-6">
          <section className="gt-surface min-h-0">
            <div className="mb-4 h-6 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="grid gap-3.5">
              <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
              <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
              <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
              <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
            </div>
          </section>

          <section className="gt-surface min-h-0">
            <div className="mb-4 grid gap-2">
              <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-full max-w-72 animate-pulse rounded-full bg-white/5" />
            </div>
            <div className="grid gap-4">
              <div className="h-12 animate-pulse rounded-xl bg-white/6" />
              <div className="h-12 animate-pulse rounded-xl bg-white/6" />
              <div className="h-12 animate-pulse rounded-xl bg-white/6" />
              <div className="h-14 w-40 animate-pulse rounded-xl bg-white/6" />
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
