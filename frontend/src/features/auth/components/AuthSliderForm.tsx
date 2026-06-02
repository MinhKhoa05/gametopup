import { FormEvent } from 'react';
import { AuthFields } from './AuthFields';
import { AuthFormState, AuthMode } from '../../../store/auth.store';

type AuthSliderFormProps = {
  busy: boolean;
  form: AuthFormState;
  mode: AuthMode;
  onChange: (next: AuthFormState) => void;
  onSubmit: (event: FormEvent) => void;
  onSwitchMode: (mode: AuthMode) => void;
};

export function AuthSliderForm({ busy, form, mode, onChange, onSubmit, onSwitchMode }: AuthSliderFormProps) {
  const isRegister = mode === 'register';

  return (
    <div className="mx-auto flex w-full max-w-[340px] flex-col gap-4">
      <div className="grid gap-1.5 text-center">
        <h3 className="m-0 text-[1.8rem] font-black leading-none text-white">{isRegister ? 'Đăng ký' : 'Đăng nhập'}</h3>
        <span className="block text-sm leading-6 text-slate-400">
          {isRegister
            ? 'Đăng ký để trải nghiệm nạp game và quản lý ví dễ dàng.'
            : 'Tiếp tục với tài khoản GameTopUp của bạn.'}
        </span>
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <AuthFields mode={mode} busy={busy} form={form} onChange={onChange} submitClassName="mt-2" />

        <div className="block text-center text-sm text-slate-400 md:hidden">
          {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
          <button type="button" onClick={() => onSwitchMode(isRegister ? 'login' : 'register')} className="font-bold text-cyanline">
            {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
          </button>
        </div>
      </form>
    </div>
  );
}
