import type { FormEvent } from 'react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { AuthSection } from '../components/account/AuthSection';
import { AccountProfileSection } from '../components/account/AccountProfileSection';
import type { Route } from '../lib/routes';
import type { AuthFormData, AuthMode, AuthStatus, User, WalletInfo } from '../types';
import { useProfileEditor } from '../hooks/user.hooks';

export function AccountPage({
  wallet,
  ordersCount,
  busy,
  onSubmit,
  onLogout,
  authForm,
  authMode,
  user,
  authStatus,
  onChangeAuthForm,
  onSwitchAuthMode,
  navigate,
}: {
  wallet: WalletInfo | null;
  ordersCount: number;
  busy: boolean;
  onSubmit: (e: FormEvent) => void;
  onLogout: () => void;
  authForm: AuthFormData;
  authMode: AuthMode;
  user: User | null;
  authStatus: AuthStatus;
  onChangeAuthForm: (next: AuthFormData) => void;
  onSwitchAuthMode: (mode: AuthMode) => void;
  navigate: (route: Route) => void;
}) {
  const profileEditor = useProfileEditor({ user });

  if (authStatus === 'checking' && !user) {
    return <AccountPageLoading />;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-[14px]">
      <header className="grid items-end gap-2">
        <div className="grid gap-1.5">
          <h1 className="m-0 text-[clamp(1.9rem,2.7vw,2.75rem)] font-black leading-none text-white">Tài khoản của tôi</h1>
          <p className="m-0 max-w-[720px] text-[0.95rem] leading-[1.55] text-[#a7b7ca]">
            Quản lý thông tin tài khoản và theo dõi nhanh các hoạt động của bạn.
          </p>
        </div>
      </header>

      {!user ? (
        <AuthSection
          busy={busy}
          form={authForm}
          authMode={authMode}
          onChange={onChangeAuthForm}
          onSubmit={onSubmit}
          onSwitchMode={onSwitchAuthMode}
        />
      ) : (
        <AccountProfileSection
          user={user}
          wallet={wallet}
          ordersCount={ordersCount}
          busy={profileEditor.isPending}
          navigate={navigate}
          onLogout={onLogout}
          profileEditor={profileEditor}
        />
      )}
    </div>
  );
}

function AccountPageLoading() {
  return (
    <div className="mx-auto grid max-w-7xl gap-[14px]" aria-busy="true" aria-label="Đang xác thực tài khoản">
      <header className="grid items-end gap-2">
        <div className="grid gap-1.5">
          <div className="h-12 w-[min(100%,18rem)] animate-pulse rounded-2xl bg-white/8" />
          <div className="h-5 w-[min(100%,28rem)] animate-pulse rounded-full bg-white/5" />
        </div>
      </header>

      <section className="grid gap-4 overflow-hidden rounded-[16px] border border-white/5 bg-ink-light p-0">
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

        <div className="account-bottom-grid">
          <section className="gametopup-surface min-h-0">
            <SectionHeading className="mb-4" title="Lối đi nhanh" />
            <div className="grid gap-3.5">
              <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
              <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
              <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
              <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
            </div>
          </section>

          <section className="gametopup-surface min-h-0">
            <SectionHeading className="mb-4" title="Thông tin cá nhân" description="Đang đồng bộ dữ liệu tài khoản." />
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
