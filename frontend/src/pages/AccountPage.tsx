import { FormEvent } from 'react';
import { Gamepad2, LogOut, Settings, ShieldCheck, UserRound, WalletCards, ChevronRight } from 'lucide-react';
import { User, WalletInfo } from '../types';
import { userDisplayName } from '../lib/labels';
import { classNames } from '../lib/ui';
import { Field } from '../components/common/Field';
import { formatCurrency } from '../lib/format';

export function AccountPage({
  authMode,
  setAuthMode,
  form,
  setForm,
  user,
  wallet,
  busy,
  onSubmit,
  onLogout,
}: {
  authMode: 'login' | 'register';
  setAuthMode: (m: 'login' | 'register') => void;
  form: any;
  setForm: (f: any) => void;
  user: User | null;
  wallet: WalletInfo | null;
  busy: boolean;
  onSubmit: (e: FormEvent) => void;
  onLogout: () => void;
}) {
  if (!user) {
    return (
      <div className={classNames("auth-page-slider", authMode === 'register' && "right-panel-active")}>
        <div className="slider-form-container login-container">
          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); setAuthMode('login'); onSubmit(e); }}>
            <h3>Đăng nhập</h3>
            <span className="mb-4 block text-sm text-slate-400">Mừng bạn quay trở lại! Đăng nhập để tiếp tục giao dịch.</span>
            <Field label="Email" value={form.email} onChange={(v) => setForm({...form, email: v})} placeholder="customer01@gametopup.com" type="email" />
            <Field label="Mật khẩu" value={form.password} onChange={(v) => setForm({...form, password: v})} placeholder="Nhập mật khẩu" type="password" />
            <button className="btn-primary w-full text-lg mt-2" type="submit" disabled={busy}>
              {busy ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
            <div className="mt-4 text-center text-sm text-slate-400 block md:hidden">
              Chưa có tài khoản? <button type="button" onClick={() => setAuthMode('register')} className="text-cyanline font-bold">Đăng ký ngay</button>
            </div>
          </form>
        </div>
        
        <div className="slider-form-container register-container">
          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); setAuthMode('register'); onSubmit(e); }}>
            <h3>Tạo tài khoản</h3>
            <span className="mb-4 block text-sm text-slate-400">Tạo tài khoản để trải nghiệm nạp game và quản lý ví dễ dàng.</span>
            <Field label="Tên hiển thị" value={form.name} onChange={(v) => setForm({...form, name: v})} placeholder="Nguyễn Văn A" />
            <Field label="Email" value={form.email} onChange={(v) => setForm({...form, email: v})} placeholder="customer01@gametopup.com" type="email" />
            <Field label="Mật khẩu" value={form.password} onChange={(v) => setForm({...form, password: v})} placeholder="Nhập mật khẩu" type="password" />
            <button className="btn-primary w-full text-lg mt-2" type="submit" disabled={busy}>
              {busy ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
            <div className="mt-4 text-center text-sm text-slate-400 block md:hidden">
              Đã có tài khoản? <button type="button" onClick={() => setAuthMode('login')} className="text-cyanline font-bold">Đăng nhập</button>
            </div>
          </form>
        </div>
        
        <div className="slider-overlay-container">
          <div className="slider-overlay">
            <div className="slider-overlay-panel overlay-left">
              <h2>Chào bạn mới!</h2>
              <p>Đăng ký ngay để trải nghiệm dịch vụ nạp game chiết khấu cao và tiện lợi nhất.</p>
              <button className="btn-outline mt-4" onClick={() => setAuthMode('login')} type="button">Đã có tài khoản?</button>
            </div>
            <div className="slider-overlay-panel overlay-right">
              <h2>Mừng trở lại!</h2>
              <p>Quản lý ví và theo dõi lịch sử đơn hàng của bạn. Tiếp tục giao dịch ngay hôm nay.</p>
              <button className="btn-outline mt-4" onClick={() => setAuthMode('register')} type="button">Chưa có tài khoản?</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-white mb-8">Tài Khoản</h1>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <div className="space-y-4">
          <div className="panel text-center">
            <div className="w-20 h-20 bg-cyanline/20 text-cyanline rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-cyanline/50">
              <UserRound size={40} />
            </div>
            <h2 className="text-xl font-bold text-white">{userDisplayName(user)}</h2>
            <span className="text-slate-400 text-sm">{user.email}</span>
            <div className="mt-4 pt-4 border-t border-white/5">
              <span className="text-sm text-slate-500 uppercase tracking-wide font-bold">Số dư ví</span>
              <div className="text-2xl font-black text-cyanline">{formatCurrency(wallet?.balance || 0)}</div>
            </div>
          </div>

          <div className="panel p-2">
            <button className="w-full text-left px-4 py-3 text-white hover:bg-white/5 rounded-xl font-bold flex items-center gap-3 active bg-white/5 text-cyanline">
              <Settings size={20} /> Cài đặt chung
            </button>
            <button className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-bold flex items-center gap-3 mt-1" onClick={onLogout}>
              <LogOut size={20} /> Đăng xuất
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel">
            <h3 className="font-bold text-lg text-white mb-4">Thông tin cá nhân</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-sm text-slate-400 mb-1">Họ tên</span>
                <div className="bg-ink-lighter p-3 rounded-lg border border-white/5 text-white">{user.name || '---'}</div>
              </div>
              <div>
                <span className="block text-sm text-slate-400 mb-1">Username</span>
                <div className="bg-ink-lighter p-3 rounded-lg border border-white/5 text-white">{user.username}</div>
              </div>
              <div className="col-span-2">
                <span className="block text-sm text-slate-400 mb-1">Email</span>
                <div className="bg-ink-lighter p-3 rounded-lg border border-white/5 text-white">{user.email}</div>
              </div>
            </div>
            <div className="mt-6">
              <button className="btn-outline">Cập nhật thông tin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
