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
import type { AuthFormState, AuthMode, AuthStatus, AuthUserSnapshot } from '../../types/auth.types';
import type { User } from '../../types';

export type AuthPanelProps = {
  authMode: AuthMode;
  form: AuthFormState;
  wallet: WalletInfo | null;
  busy: boolean;
  user: User | null;
  authStatus: AuthStatus;
  userSnapshot: AuthUserSnapshot | null;
  onSubmit: (event: FormEvent) => void;
  onLogout: () => void;
  onChangeAuthForm: (next: AuthFormState) => void;
  onSwitchMode: (mode: AuthMode) => void;
};

export function AuthPanel({ wallet, busy, onSubmit, onLogout, authMode, form, user, authStatus, userSnapshot, onChangeAuthForm, onSwitchMode }: AuthPanelProps) {
  const hasLogin = Boolean(user || (authStatus !== 'guest' && userSnapshot));
  const displayName = userDisplayName(user) || userSnapshot?.displayName || 'Khách';
  const isRegister = authMode === 'register';

  return (
    <aside className="gametopup-surface h-fit self-start bg-gradient-to-br from-ink-lighter to-ink-light">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <IconBox size="md">
            {hasLogin ? <UserRound size={23} /> : isRegister ? <UserPlus size={23} /> : <ShieldCheck size={23} />}
          </IconBox>
          <div>
            <p className="eyebrow">{hasLogin ? 'Xin chào' : isRegister ? 'Chào bạn mới' : 'Đăng nhập'}</p>
            <h3 className="text-xl font-bold text-white">{hasLogin ? displayName : isRegister ? 'Đăng ký' : 'Đăng nhập'}</h3>
          </div>
        </div>
        {hasLogin ? (
          <button className="icon-button" type="button" onClick={onLogout} disabled={busy} title="Đăng xuất">
            <LogOut size={18} />
          </button>
        ) : null}
      </div>

      {hasLogin ? (
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <StatCard icon={<WalletCards size={20} />} label="Số dư ví" value={formatCurrency(wallet?.balance ?? 0)} />
          <StatCard icon={<BadgeCheck size={20} />} label="Tài khoản" value={user?.role ?? userSnapshot?.role ?? 'Khách hàng'} />
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={authMode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
                <AuthFields mode={authMode} busy={busy} form={form} onChange={onChangeAuthForm} />
              </form>
            </motion.div>
          </AnimatePresence>

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
        </>
      )}
    </aside>
  );
}
