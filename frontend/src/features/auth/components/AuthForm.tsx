import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react';
import { Button, Field } from '@/shared/components';
import type { AuthMode } from '../hooks/useAuthSession';
import type { AuthFormData } from '../types';

type AuthFormProps = {
  mode: AuthMode;
  busy: boolean;
  onSubmitAuth: (mode: AuthMode, form: AuthFormData) => Promise<unknown>;
  switchHref: string;
  switchLabel: string;
  switchPrompt: string;
};

export function AuthForm({ busy, mode, onSubmitAuth, switchHref, switchLabel, switchPrompt }: AuthFormProps) {
  const [form, setForm] = useState<AuthFormData>({
    displayName: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';
  const passwordType = showPassword ? 'text' : 'password';

  return (
    <form
      className="grid gap-4"
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
          required
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
        required
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
        required
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
          required
        />
      ) : null}

      {error ? <p className="text-sm font-medium text-rose-200">{error}</p> : null}

      <Button type="submit" variant="primary" disabled={busy}>
        {busy ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
      </Button>

      <p className="text-center text-sm text-slate-400">
        {switchPrompt}{' '}
        <Link to={switchHref} className="font-semibold text-cyan-200 transition-colors hover:text-cyan-50">
          {switchLabel}
        </Link>
      </p>
    </form>
  );
}
