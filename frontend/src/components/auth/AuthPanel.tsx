import { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, LogOut, ShieldCheck, UserPlus, UserRound, WalletCards } from 'lucide-react';
import { Badge } from '../common/Badge';
import { IconBox } from '../common/IconBox';
import { StatCard } from '../common/StatCard';
import { formatCurrency } from '../../lib/format';
import { userDisplayName } from '../../lib/labels';
import { WalletInfo } from '../../types';
import { AuthFields } from './AuthFields';
import type { AuthFormState, AuthMode } from '../../types/auth.types';
import type { User } from '../../types';

export type AuthPanelProps = {
  authMode: AuthMode;
  form: AuthFormState;
  wallet: WalletInfo | null;
  busy: boolean;
  user: User | null;
  onSubmit: (event: FormEvent) => void;
  onLogout: () => void;
  onChangeAuthForm: (next: AuthFormState) => void;
  onSwitchMode: (mode: AuthMode) => void;
};

export function AuthPanel({ wallet, busy, onSubmit, onLogout, authMode, form, user, onChangeAuthForm, onSwitchMode }: AuthPanelProps) {
  if (user) {
    return (
      <aside className="gametopup-surface bg-gradient-to-br from-ink-lighter to-ink-light">
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
    <aside className="gametopup-surface">
      <AnimatePresence mode="wait">
        <motion.div
          key={authMode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          <div className="flex items-center gap-3">
            <IconBox size="md">{isRegister ? <UserPlus size={24} /> : <ShieldCheck size={24} />}</IconBox>
            <h3 className="text-xl font-bold text-white">{isRegister ? 'Đăng ký' : 'Đăng nhập'}</h3>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <AuthFields mode={authMode} busy={busy} form={form} onChange={onChangeAuthForm} />
          </form>

          <div className="mt-4 flex items-center justify-center gap-2 border-t border-white/7 pt-4 text-sm text-slate-400">
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            <button
              type="button"
              onClick={() => onSwitchMode(isRegister ? 'login' : 'register')}
              className="font-bold text-cyanline"
            >
              {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
