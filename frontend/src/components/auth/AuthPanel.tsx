import { FormEvent } from 'react';
import { BadgeCheck, LogOut, ShieldCheck, UserPlus, UserRound, WalletCards } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import { userDisplayName } from '../../lib/labels';
import { WalletInfo } from '../../types';
import { IconBox } from '../common/IconBox';
import { StatCard } from '../common/StatCard';
import { Field } from '../common/Field';
import { authStore, useAuthStore } from '../../store/auth.store';

export type AuthPanelProps = {
  wallet: WalletInfo | null;
  busy: boolean;
  onSubmit: (event: FormEvent) => void;
  onLogout: () => void;
};

export function AuthPanel({ wallet, busy, onSubmit, onLogout }: AuthPanelProps) {
  const authMode = useAuthStore((state) => state.authMode);
  const form = useAuthStore((state) => state.authForm);
  const user = useAuthStore((state) => state.user);

  if (user) {
    return (
      <aside className="panel bg-gradient-to-br from-ink-lighter to-ink-light">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <IconBox size="md">
              <UserRound size={23} />
            </IconBox>
            <div>
              <p className="eyebrow">Xin chào</p>
              <h3 className="text-xl font-bold text-white">{userDisplayName(user)}</h3>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onLogout} disabled={busy} title="Đăng xuất">
            <LogOut size={18} />
          </button>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <StatCard icon={<WalletCards size={20} />} label="Số dư ví" value={formatCurrency(wallet?.balance ?? 0)} />
          <StatCard icon={<BadgeCheck size={20} />} label="Tài khoản" value={user.role ?? 'Khách hàng'} />
        </div>
      </aside>
    );
  }

  const isRegister = authMode === 'register';

  return (
    <aside className="auth-card">
      <div className="auth-card-header">
        <IconBox size="md">
          {isRegister ? <UserPlus size={24} /> : <ShieldCheck size={24} />}
        </IconBox>
        <div>
          <p className="eyebrow">Tài khoản</p>
          <h3>{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</h3>
          <span>
            {isRegister
              ? 'Tạo tài khoản để quản lý ví và theo dõi đơn hàng.'
              : 'Đăng nhập để tiếp tục nạp game và thanh toán bằng ví.'}
          </span>
        </div>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        {isRegister && (
          <Field
            label="Tên hiển thị"
            value={form.displayName}
            onChange={(value) => authStore.setAuthForm({ ...form, displayName: value })}
            placeholder="Nguyễn Văn A"
          />
        )}
        <Field
          label="Email"
          value={form.email}
          onChange={(value) => authStore.setAuthForm({ ...form, email: value })}
          placeholder="customer01@gametopup.com"
          type="email"
        />
        <Field
          label="Mật khẩu"
          value={form.password}
          onChange={(value) => authStore.setAuthForm({ ...form, password: value })}
          placeholder="Nhập mật khẩu"
          type="password"
        />
        <button className="btn-primary w-full text-lg" type="submit" disabled={busy}>
          {busy ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-center gap-2 border-t border-white/7 pt-4 text-sm text-slate-400">
        {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
        <button
          type="button"
          onClick={() => authStore.setAuthMode(isRegister ? 'login' : 'register')}
          className="font-bold text-cyanline"
        >
          {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
        </button>
      </div>
    </aside>
  );
}
