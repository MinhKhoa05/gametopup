import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { EmptyState } from '@/shared/components';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useMyOrdersQuery } from '@/features/orders/server';
import { useWalletBalanceQuery } from '@/features/wallet/server';
import { useUpdateMyProfileMutation } from '@/features/profile/server';
import { ProfileEditForm } from '@/features/profile/components/ProfileEditForm';
import { ProfileQuickActions } from '@/features/profile/components/ProfileQuickActions';
import { ProfileSummary } from '@/features/profile/components/ProfileSummary';
import type { User } from '@/features/auth/types';

export function ProfilePage() {
  const auth = useAuthSession();
  const user = auth.user;

  if (auth.status === 'checking' && !user) {
    return <ProfilePageLoading />;
  }

  if (!user) {
    return <EmptyState title="Không có phiên đăng nhập" description="Vui lòng đăng nhập lại để xem tài khoản." />;
  }

  return <ProfileContent user={user} onLogout={auth.handleLogout} />;
}

function ProfileContent({ onLogout, user }: { onLogout: () => void; user: User }) {
  const walletQuery = useWalletBalanceQuery(true);
  const ordersQuery = useMyOrdersQuery();
  const updateProfileMutation = useUpdateMyProfileMutation();
  const [draftName, setDraftName] = useState('');

  useEffect(() => {
    setDraftName(user.displayName ?? '');
  }, [user.displayName, user.email, user.id]);

  const stats = useMemo(
    () => ({
      ordersCount: ordersQuery.data?.length ?? 0,
      walletBalance: walletQuery.data ?? 0,
    }),
    [ordersQuery.data, walletQuery.data],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await updateProfileMutation.mutateAsync({
      userId: user.id,
      displayName: draftName.trim(),
    });
  }

  const canSave = draftName.trim().length > 0 && draftName.trim() !== (user.displayName ?? '').trim();
  const isLoading = (walletQuery.isPending && !walletQuery.data) || (ordersQuery.isPending && !ordersQuery.data);

  return (
    <AppPageContainer className="grid gap-3.5 py-8">
      <header className="grid items-end gap-2">
        <div className="grid gap-1.5">
          <p className="gt-eyebrow">Account</p>
          <h1 className="m-0 text-[clamp(1.9rem,2.7vw,2.75rem)] font-black leading-none text-white">Tài khoản của tôi</h1>
          <p className="m-0 max-w-2xl text-sm leading-6 text-slate-400">Quản lý thông tin tài khoản và theo dõi nhanh các hoạt động của bạn.</p>
        </div>
      </header>

      <section className="gt-surface-ink grid gap-4 overflow-hidden rounded-2xl p-0">
        {isLoading ? <ProfilePageLoadingSummary /> : <ProfileSummary user={user} balance={stats.walletBalance} ordersCount={stats.ordersCount} />}

        <div className="grid grid-cols-1 items-stretch gap-4 px-4 pb-4 md:px-5 md:pb-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:px-6 lg:pb-6">
          <ProfileQuickActions onLogout={onLogout} />
          <ProfileEditForm
            busy={updateProfileMutation.isPending}
            canSave={canSave}
            draftName={draftName}
            email={user.email}
            errorMessage={updateProfileMutation.error instanceof Error ? updateProfileMutation.error.message : null}
            onDraftNameChange={setDraftName}
            onSubmit={handleSubmit}
          />
        </div>
      </section>
    </AppPageContainer>
  );
}

function ProfilePageLoading() {
  return (
    <AppPageContainer className="grid gap-3.5 py-8" aria-busy="true" aria-label="Đang xác thực tài khoản">
      <header className="grid items-end gap-2">
        <div className="grid gap-1.5">
          <div className="h-12 w-full max-w-72 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-5 w-full max-w-72 animate-pulse rounded-full bg-white/5" />
        </div>
      </header>

      <section className="gt-surface-ink grid gap-4 overflow-hidden rounded-2xl p-0">
        <ProfilePageLoadingSummary />

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
    </AppPageContainer>
  );
}

function ProfilePageLoadingSummary() {
  return (
    <div className="grid gap-0 px-4 pt-5 pb-6 md:p-5 lg:px-6 lg:pt-5 lg:pb-6" aria-hidden="true">
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.15fr)_1px_minmax(0,1fr)] lg:gap-0">
        <div className="grid grid-cols-1 items-center gap-4 pr-0 md:grid-cols-[auto_minmax(0,1fr)] md:justify-items-start lg:pr-6">
          <div className="h-24 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="grid min-w-0 gap-2">
            <div className="h-6 w-full max-w-72 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-full max-w-56 animate-pulse rounded-full bg-white/5" />
            <div className="flex flex-wrap gap-2.5">
              <div className="h-8 w-32 animate-pulse rounded-full bg-white/10" />
              <div className="h-8 w-28 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
        </div>
        <div className="h-px w-full self-stretch bg-slate-400/15 lg:h-auto lg:w-px" />
        <div className="grid grid-cols-1 gap-0 pl-0 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:pl-6">
          <div className="grid gap-3 p-4">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/10" />
            <div className="grid gap-1.5">
              <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
              <div className="h-7 w-32 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
          <div className="my-2 h-px w-full justify-self-center bg-slate-400/20 lg:my-0 lg:h-16 lg:w-px" />
          <div className="grid gap-3 p-4">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/10" />
            <div className="grid gap-1.5">
              <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
              <div className="h-7 w-32 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
