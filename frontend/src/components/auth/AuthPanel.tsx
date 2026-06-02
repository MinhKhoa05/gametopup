import { FormEvent } from 'react';
import { BadgeCheck, LogOut, ShieldCheck, UserPlus, UserRound, WalletCards } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import { userDisplayName } from '../../lib/labels';
import { WalletInfo } from '../../types';
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
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyanline/20 text-cyanline">
              <UserRound size={23} />
            </div>
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
          <div className="bg-ink-lighter p-4 rounded-xl border border-white/5">
            <span className="text-slate-400 text-sm mb-1 flex items-center gap-2">
              <WalletCards size={16} /> Số dư ví
            </span>
            <strong className="text-cyanline text-xl font-black">{formatCurrency(wallet?.balance ?? 0)}</strong>
          </div>

          <div className="bg-ink-lighter p-4 rounded-xl border border-white/5">
            <span className="text-slate-400 text-sm mb-1 flex items-center gap-2">
              <BadgeCheck size={16} /> Tài khoản
            </span>
            <strong className="text-white text-lg font-bold">{user.role ?? 'Khách hàng'}</strong>
          </div>
        </div>
      </aside>
    );
  }

  const isRegister = authMode === 'register';

  return (
    <aside className="auth-card">
      <div className="auth-card-header">
        <div className="auth-card-icon">{isRegister ? <UserPlus size={24} /> : <ShieldCheck size={24} />}</div>
        <div>
          <p className="eyebrow">Tài khoản</p>
          <h3>{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</h3>
          <span>{isRegister ? 'Tạo tài khoản để quản lý ví và theo dõi đơn hàng.' : 'Đăng nhập để tiếp tục nạp game và thanh toán bằng ví.'}</span>
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

      <div className="auth-switch">
        {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
        <button type="button" onClick={() => authStore.setAuthMode(isRegister ? 'login' : 'register')}>
          {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
        </button>
      </div>
    </aside>
  );
}
