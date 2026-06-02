import { FormEvent } from 'react';
import {
  ArrowRight,
  Gamepad2,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { Field } from '../../../components/common/Field';
import { Badge } from '../../../components/common/Badge';
import { IconBox } from '../../../components/common/IconBox';
import { SectionHeading } from '../../../components/common/SectionHeading';
import { formatCurrency } from '../../../lib/format';
import { userDisplayName } from '../../../lib/labels';
import { Route } from '../../../lib/routes';
import { classNames } from '../../../lib/ui';
import { User, WalletInfo } from '../../../types';
import { AsyncActionExecutor } from '../../../hooks/useAsyncAction';
import { useProfileEditor } from '../profile/useProfileEditor';
import { authStore, useAuthStore } from '../../../store/auth.store';

function isAdminUser(user: User) {
  if (typeof user.role === 'string') return user.role.toLowerCase().includes('admin');
  return user.role === 1;
}

export function AccountPage({
  wallet,
  ordersCount,
  busy,
  onSubmit,
  onLogout,
  onProfileUpdated,
  execute,
  navigate,
}: {
  wallet: WalletInfo | null;
  ordersCount: number;
  busy: boolean;
  onSubmit: (e: FormEvent) => void;
  onLogout: () => void;
  onProfileUpdated: (displayName: string) => void;
  execute: AsyncActionExecutor;
  navigate: (route: Route) => void;
}) {
  const user = useAuthStore((state) => state.user);
  const authMode = useAuthStore((state) => state.authMode);
  const form = useAuthStore((state) => state.authForm);

  const displayName = userDisplayName(user);
  const roleLabel = user ? (isAdminUser(user) ? 'Quản trị viên' : 'Tài khoản cá nhân') : '';
  const statusLabel = user?.isActive === false ? 'Tạm khóa' : 'Đang hoạt động';
  const profileEditor = useProfileEditor({
    user,
    execute,
    onProfileUpdated,
  });

  if (!user) {
    return (
      <div className={classNames('auth-page-slider', authMode === 'register' && 'right-panel-active')}>
        <div className="slider-form-container login-container">
          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              authStore.setAuthMode('login');
              onSubmit(e);
            }}
          >
            <h3>Đăng nhập</h3>
            <span className="mb-4 block text-sm text-slate-400">
              Mừng bạn quay trở lại! Đăng nhập để tiếp tục giao dịch.
            </span>
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => authStore.setAuthForm({ ...form, email: v })}
              placeholder="customer01@gametopup.com"
              type="email"
            />
            <Field
              label="Mật khẩu"
              value={form.password}
              onChange={(v) => authStore.setAuthForm({ ...form, password: v })}
              placeholder="Nhập mật khẩu"
              type="password"
            />
            <button className="btn-primary w-full text-lg mt-2" type="submit" disabled={busy}>
              {busy ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
            <div className="mt-4 text-center text-sm text-slate-400 block md:hidden">
              Chưa có tài khoản?{' '}
              <button type="button" onClick={() => authStore.setAuthMode('register')} className="text-cyanline font-bold">
                Đăng ký ngay
              </button>
            </div>
          </form>
        </div>

        <div className="slider-form-container register-container">
          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              authStore.setAuthMode('register');
              onSubmit(e);
            }}
          >
            <h3>Tạo tài khoản</h3>
            <span className="mb-4 block text-sm text-slate-400">
              Tạo tài khoản để trải nghiệm nạp game và quản lý ví dễ dàng.
            </span>
            <Field
              label="Tên hiển thị"
              value={form.displayName}
              onChange={(v) => authStore.setAuthForm({ ...form, displayName: v })}
              placeholder="Nguyễn Văn A"
            />
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => authStore.setAuthForm({ ...form, email: v })}
              placeholder="customer01@gametopup.com"
              type="email"
            />
            <Field
              label="Mật khẩu"
              value={form.password}
              onChange={(v) => authStore.setAuthForm({ ...form, password: v })}
              placeholder="Nhập mật khẩu"
              type="password"
            />
            <button className="btn-primary w-full text-lg mt-2" type="submit" disabled={busy}>
              {busy ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
            <div className="mt-4 text-center text-sm text-slate-400 block md:hidden">
              Đã có tài khoản?{' '}
              <button type="button" onClick={() => authStore.setAuthMode('login')} className="text-cyanline font-bold">
                Đăng nhập
              </button>
            </div>
          </form>
        </div>

        <div className="slider-overlay-container">
          <div className="slider-overlay">
            <div className="slider-overlay-panel overlay-left">
              <h2>Chào bạn mới!</h2>
              <p>Đăng ký ngay để trải nghiệm dịch vụ nạp game chiết khấu cao và tiện lợi nhất.</p>
              <button className="btn-outline mt-4" onClick={() => authStore.setAuthMode('login')} type="button">
                Đã có tài khoản?
              </button>
            </div>
            <div className="slider-overlay-panel overlay-right">
              <h2>Mừng trở lại!</h2>
              <p>Quản lý ví và theo dõi lịch sử đơn hàng của bạn. Tiếp tục giao dịch ngay hôm nay.</p>
              <button className="btn-outline mt-4" onClick={() => authStore.setAuthMode('register')} type="button">
                Chưa có tài khoản?
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page mx-auto max-w-7xl">
      <header className="account-header">
        <div className="account-heading-copy">
          <h1>Tài khoản của tôi</h1>
          <p>Quản lý thông tin tài khoản và theo dõi nhanh các hoạt động của bạn.</p>
        </div>
      </header>

      <section className="panel account-shell">
        <div className="account-summary-card">
          <div className="account-summary-top">
            <div className="account-profile-strip">
              <IconBox size="lg" className="account-avatar">
                <UserRound size={56} strokeWidth={1.8} />
              </IconBox>
              <div className="account-profile-copy">
                <div className="account-profile-name">{displayName}</div>
                <div className="account-profile-email">{user.email}</div>
                <div className="account-profile-badges">
                  <Badge tone="info" icon={<ShieldCheck size={14} />}>
                    {roleLabel}
                  </Badge>
                  <Badge
                    tone={user?.isActive === false ? 'warning' : 'success'}
                    icon={<span className="inline-block h-2 w-2 flex-none rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.12)]" />}
                  >
                    {statusLabel}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="account-summary-divider" />

            <div className="account-summary-metrics">
              <div className="account-summary-metric">
                <IconBox size="sm" className="border border-cyanline/15 bg-cyanline/10 text-cyanline shadow-[inset_0_0_22px_rgba(34,211,238,0.06)]">
                  <Mail size={24} />
                </IconBox>
                <div>
                  <small>Số dư ví</small>
                  <strong>{formatCurrency(wallet?.balance || 0)}</strong>
                </div>
              </div>

              <div className="account-summary-separator" />

              <div className="account-summary-metric">
                <IconBox size="sm" className="border border-cyanline/15 bg-cyanline/10 text-cyanline shadow-[inset_0_0_22px_rgba(34,211,238,0.06)]">
                  <ShoppingBag size={24} />
                </IconBox>
                <div>
                  <small>Đơn hàng</small>
                  <strong>{ordersCount} đơn</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="account-bottom-grid">
          <section className="gametopup-surface account-quick-card min-h-0">
            <SectionHeading title="Lối đi nhanh" />

            <div className="account-quick-actions">
              <button type="button" className="gametopup-action-row" onClick={() => navigate({ name: 'wallet' })}>
                <IconBox size="sm" className="bg-cyanline/10 text-cyanline">
                  <WalletCards size={20} />
                </IconBox>
                <span className="gametopup-action-row__copy">
                  <strong>Nạp ví</strong>
                  <small>Thêm tiền và theo dõi giao dịch</small>
                </span>
                <span className="gametopup-action-row__arrow">
                  <ArrowRight size={18} />
                </span>
              </button>

              <button type="button" className="gametopup-action-row" onClick={() => navigate({ name: 'orders' })}>
                <IconBox size="sm" className="bg-cyanline/10 text-cyanline">
                  <Gamepad2 size={20} />
                </IconBox>
                <span className="gametopup-action-row__copy">
                  <strong>Lịch sử đơn</strong>
                  <small>Xem lại các đơn đã đặt</small>
                </span>
                <span className="gametopup-action-row__arrow">
                  <ArrowRight size={18} />
                </span>
              </button>

              <button type="button" className="gametopup-action-row" onClick={() => navigate({ name: 'wallet' })}>
                <IconBox size="sm" className="bg-cyanline/10 text-cyanline">
                  <WalletCards size={20} />
                </IconBox>
                <span className="gametopup-action-row__copy">
                  <strong>Lịch sử nạp tiền</strong>
                  <small>Xem giao dịch và số dư ví</small>
                </span>
                <span className="gametopup-action-row__arrow">
                  <ArrowRight size={18} />
                </span>
              </button>

              <button type="button" className="gametopup-action-row" onClick={onLogout}>
                <IconBox size="sm" className="bg-red-500/10 text-red-300">
                  <LogOut size={20} />
                </IconBox>
                <span className="gametopup-action-row__copy">
                  <strong>Đăng xuất</strong>
                  <small>Thoát khỏi tài khoản hiện tại</small>
                </span>
                <span className="gametopup-action-row__arrow">
                  <ArrowRight size={18} />
                </span>
              </button>
            </div>
          </section>

          <section className="gametopup-surface account-note-card account-note-card--form min-h-0">
            <SectionHeading
              title="Thông tin cá nhân"
              description="Cập nhật thông tin hiển thị trên tài khoản của bạn."
            />

            <form className="grid gap-4" onSubmit={profileEditor.handleSubmit}>
              <Field
                label="Tên hiển thị"
                value={profileEditor.draftName}
                onChange={profileEditor.setDraftName}
                placeholder="Nhập tên hiển thị"
              />

              <Field label="Email" placeholder={user.email} readOnly value={user.email} />

              <div className="flex items-start gap-2 text-sm leading-6 text-slate-400">
                <ShieldCheck size={16} />
                <span>Email là định danh đăng nhập. Hệ thống không dùng username.</span>
              </div>

              {profileEditor.saveError && (
                <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {profileEditor.saveError}
                </div>
              )}

              <div className="flex w-full justify-start gap-2 pt-0.5">
                <button className="btn-primary min-w-[156px]" type="submit" disabled={!profileEditor.canSave || busy}>
                  <Save size={16} />
                  {busy ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </div>
  );
}
