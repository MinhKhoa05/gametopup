import { Field } from '../common/Field';
import { classNames } from '../../lib/ui';
import { AuthFormState, AuthMode } from '../../store/auth.store';

export type AuthFieldsProps = {
  mode: AuthMode;
  busy: boolean;
  form: AuthFormState;
  onChange: (form: AuthFormState) => void;
  submitClassName?: string;
};

export function AuthFields({ mode, busy, form, onChange, submitClassName = '' }: AuthFieldsProps) {
  const isRegister = mode === 'register';

  return (
    <>
      {isRegister && (
        <Field
          label="Tên hiển thị"
          value={form.displayName}
          onChange={(value) => onChange({ ...form, displayName: value })}
          placeholder="Nguyễn Văn A"
        />
      )}

      <Field
        label="Email"
        value={form.email}
        onChange={(value) => onChange({ ...form, email: value })}
        placeholder="customer01@gametopup.com"
        type="email"
      />

      <Field
        label="Mật khẩu"
        value={form.password}
        onChange={(value) => onChange({ ...form, password: value })}
        placeholder="Nhập mật khẩu"
        type="password"
      />

      <button className={classNames('btn-primary w-full text-lg', submitClassName)} type="submit" disabled={busy}>
        {busy ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
      </button>
    </>
  );
}
