import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react';
import { Button, Field } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import type { AuthMode } from '../hooks/useAuthSession';
import type { AuthFormData } from '../types';

type AuthFormProps = {
  mode: AuthMode;
  busy: boolean;
  initialEmail?: string;
  onSubmitAuth: (mode: AuthMode, form: AuthFormData) => Promise<unknown>;
  onSwitchMode?: (mode: AuthMode) => void;
  className?: string;
};

export function AuthForm({ busy, className, initialEmail = '', mode, onSubmitAuth, onSwitchMode }: AuthFormProps) {
  const [form, setForm] = useState<AuthFormData>({
    displayName: '',
    email: initialEmail,
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';
  const passwordType = showPassword ? 'text' : 'password';

  return (
    <form
      className={classNames('auth-form', className)}
      onSubmit={async (event) => {
        event.preventDefault();

        if (isRegister && confirmPassword !== form.password) {
          setError('Mật khẩu xác nhận chưa khớp.');
          return;
        }

        setError('');

        try {
          await onSubmitAuth(mode, form);
        } catch (submitError) {
          setError(submitError instanceof Error ? submitError.message : 'Không thể thực hiện yêu cầu.');
        }
      }}
    >
      {isRegister ? (
        <Field
          label="Tên hiển thị"
          value={form.displayName}
          onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
          placeholder="Nguyễn Văn A"
          autoComplete="name"
          trailing={<UserRound size={18} />}
        />
      ) : null}

      <Field
        label="Email"
        value={form.email}
        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        placeholder="Nhập email của bạn"
        type="email"
        autoComplete="email"
        trailing={<Mail size={18} />}
      />

      <Field
        label="Mật khẩu"
        value={form.password}
        onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
        placeholder="Nhập mật khẩu"
        type={passwordType}
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        trailing={
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-transparent text-slate-300 transition-all duration-200 hover:-translate-y-px hover:bg-cyan/10 hover:text-cyan-50 focus-visible:-translate-y-px focus-visible:bg-cyan/10 focus-visible:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        }
      />

      {isRegister ? (
        <Field
          label="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Nhập lại mật khẩu"
          type={passwordType}
          autoComplete="new-password"
          trailing={<Lock size={18} />}
        />
      ) : null}

      {error ? <p className="text-sm font-medium text-rose-200">{error}</p> : null}

      <Button type="submit" variant="primary" disabled={busy}>
        {busy ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
      </Button>

      {!isRegister ? (
        <div className="grid gap-3.5 rounded-2xl pt-1">
          <div className="flex items-center gap-3 text-[0.82rem] text-slate-400">
            <span className="h-px flex-1 bg-white/8" aria-hidden="true" />
            <span className="whitespace-nowrap">Hoặc đăng nhập với</span>
            <span className="h-px flex-1 bg-white/8" aria-hidden="true" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              disabled
              className="h-11 justify-center gap-2 px-4 text-[0.93rem] font-semibold"
              title="Tính năng đang được phát triển"
            >
              <span className="inline-flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-[#4285F4]/15 text-[0.92rem] font-black text-[#4285F4]">
                  G
                </span>
                Google
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled
              className="h-11 justify-center gap-2 px-4 text-[0.93rem] font-semibold"
              title="Tính năng đang được phát triển"
            >
              <span className="inline-flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-[#1877F2]/15 text-[0.92rem] font-black text-[#1877F2]">
                  f
                </span>
                Facebook
              </span>
            </Button>
          </div>
        </div>
      ) : null}

      {onSwitchMode ? (
        <div className="pt-1 text-center text-[0.88rem] text-slate-400">
          {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
          <button
            type="button"
            onClick={() => onSwitchMode(isRegister ? 'login' : 'register')}
            className="font-bold text-cyan transition-colors hover:text-cyan-50"
          >
            {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
          </button>
        </div>
      ) : null}
    </form>
  );
}
