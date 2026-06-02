import { FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  Gamepad2,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { Field } from '../../../components/common/Field';
import { Badge } from '../../../components/common/Badge';
import { IconBox } from '../../../components/common/IconBox';
import { StatCard } from '../../../components/common/StatCard';
import { SectionHeading } from '../../../components/common/SectionHeading';
import { AuthSliderForm } from '../../../features/auth/components/AuthSliderForm';
import { formatCurrency } from '../../../lib/format';
import { userDisplayName } from '../../../lib/labels';
import { Route } from '../../../lib/routes';
import { classNames } from '../../../lib/ui';
import { User, WalletInfo } from '../../../types';
import { AsyncActionExecutor } from '../../../hooks/useAsyncAction';
import { useProfileEditor } from '../hooks/useProfileEditor';
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
      <div className={classNames('auth-page-slider !w-full', authMode === 'register' && 'right-panel-active')}>
        <div className="slider-form-container login-container">
          <AuthSliderForm
            busy={busy}
            form={form}
            mode="login"
            onChange={(next) => authStore.setAuthForm(next)}
            onSubmit={(e) => {
              e.preventDefault();
              authStore.setAuthMode('login');
              onSubmit(e);
            }}
            onSwitchMode={(mode) => authStore.setAuthMode(mode)}
          />
        </div>

        <div className="slider-form-container register-container">
          <AuthSliderForm
            busy={busy}
            form={form}
            mode="register"
            onChange={(next) => authStore.setAuthForm(next)}
            onSubmit={(e) => {
              e.preventDefault();
              authStore.setAuthMode('register');
              onSubmit(e);
            }}
            onSwitchMode={(mode) => authStore.setAuthMode(mode)}
          />
        </div>

        <div className="slider-overlay-container">
          <div className="slider-overlay">
            <div className="slider-overlay-panel overlay-left">
              <IconBox size="lg" className="mb-4 bg-white/10 text-white">
                <UserPlus size={28} />
              </IconBox>
              <h2>Chào bạn mới!</h2>
              <p>Đăng ký ngay để trải nghiệm dịch vụ nạp game chiết khấu cao và tiện lợi nhất.</p>
              <ul className="my-4 flex flex-col gap-2 text-left text-sm text-[#b0bfd3]">
                <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Chiết khấu nạp game hấp dẫn</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Thanh toán đa kênh tiện lợi</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Hỗ trợ khách hàng 24/7</li>
              </ul>
              <button className="btn-outline mt-2" onClick={() => authStore.setAuthMode('login')} type="button">
                Đã có tài khoản?
              </button>
            </div>
            <div className="slider-overlay-panel overlay-right">
              <IconBox size="lg" className="mb-4 bg-white/10 text-white">
                <ShieldCheck size={28} />
              </IconBox>
              <h2>Mừng trở lại!</h2>
              <p>Quản lý ví và theo dõi lịch sử đơn hàng của bạn.</p>
              <ul className="my-4 flex flex-col gap-2 text-left text-sm text-[#b0bfd3]">
                <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Quản lý số dư ví</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Theo dõi trạng thái đơn hàng</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Thanh toán nhanh hơn</li>
              </ul>
              <button className="btn-outline mt-2" onClick={() => authStore.setAuthMode('register')} type="button">
                Tạo tài khoản mới
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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

      <section className="grid gap-4 overflow-hidden rounded-[16px] border border-white/5 bg-ink-light p-0">
        <div className="account-summary-card">
          <div className="account-summary-top">
            <div className="account-profile-strip">
              <IconBox
                size="lg"
                className="account-avatar"
              >
                <UserRound size={56} strokeWidth={1.8} />
              </IconBox>
              <div className="grid min-w-0 gap-2">
                <div className="text-[clamp(1.2rem,1.55vw,1.6rem)] font-black leading-[1.1] text-white">{displayName}</div>
                <div className="text-[0.9rem] text-[#b0bfd3]">{user.email}</div>
                <div className="flex flex-wrap gap-2.5">
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
              <StatCard
                surface={false}
                variant="inline"
                iconClassName="border border-cyanline/15 bg-cyanline/10 text-cyanline shadow-[inset_0_0_22px_rgba(34,211,238,0.06)]"
                icon={<Mail size={24} />}
                label="Số dư ví"
                value={formatCurrency(wallet?.balance || 0)}
              />

              <div className="account-summary-separator" />

              <StatCard
                surface={false}
                variant="inline"
                iconClassName="border border-cyanline/15 bg-cyanline/10 text-cyanline shadow-[inset_0_0_22px_rgba(34,211,238,0.06)]"
                icon={<ShoppingBag size={24} />}
                label="Đơn hàng"
                value={`${ordersCount} đơn`}
              />
            </div>
          </div>
        </div>

        <div className="account-bottom-grid">
          <section className="gametopup-surface min-h-0">
            <SectionHeading className="mb-4" title="Lối đi nhanh" />

            <div className="grid gap-3.5">
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

          <section className="gametopup-surface min-h-0">
            <SectionHeading
              className="mb-4"
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
