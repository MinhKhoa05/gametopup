import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/shared/components';
import { SITE } from '@/app/config/site';
import { AuthForm } from '@/features/auth/components/AuthForm';
import { useAuthSession, type AuthMode } from '@/features/auth/hooks/useAuthSession';
import { SiteCredits } from '@/app/site-shell/SiteCredits';

type AuthPageProps = {
  mode: AuthMode;
};

export function AuthPage({ mode }: AuthPageProps) {
  const { isSubmitting, submitAuth } = useAuthSession();
  const isRegister = mode === 'register';
  const title = isRegister ? 'Tạo tài khoản' : 'Đăng nhập';
  const description = isRegister
    ? 'Tạo tài khoản để theo dõi đơn hàng, quản lý ví và xem lịch sử giao dịch ở một nơi.'
    : 'Đăng nhập để tiếp tục nạp game, xem đơn hàng và quản lý ví của bạn.';
  const switchPrompt = isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?';
  const switchLabel = isRegister ? 'Đăng nhập' : 'Đăng ký';
  const switchHref = isRegister ? '/login' : '/register';
  const benefits = isRegister
    ? ['Theo dõi đơn hàng', 'Quản lý số dư ví', 'Lưu lịch sử giao dịch']
    : ['Nạp game nhanh chóng', 'Theo dõi đơn hàng', 'Hỗ trợ 24/7'];

  return (
    <div className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.96)_0%,rgba(2,6,23,1)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:40px_40px]"
      />

      <section className="relative flex w-full flex-1 items-center justify-center">
        <div className="mx-auto grid w-full max-w-[30rem] gap-6">
          <div className="text-center">
            <Badge variant="accent" className="uppercase tracking-[0.24em]">
              {SITE.name}
            </Badge>
            <h1 className="mt-5 text-[clamp(2rem,4vw,2.65rem)] font-black leading-[0.96] tracking-tight text-white">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-[36ch] text-sm leading-6 text-slate-300 sm:text-[0.95rem]">{description}</p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[rgba(6,11,22,0.92)] px-5 py-6 shadow-[0_28px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:px-7 sm:py-7">
            <div className="flex items-center gap-3 text-[0.82rem] text-slate-400">
              <ShieldCheck size={15} className="shrink-0 text-cyan-300" />
              <span>Phiên đăng nhập được bảo vệ và lưu lịch sử giao dịch rõ ràng.</span>
            </div>

            <div className="mt-5">
              <AuthForm
                mode={mode}
                busy={isSubmitting}
                onSubmitAuth={submitAuth}
                switchHref={switchHref}
                switchLabel={switchLabel}
                switchPrompt={switchPrompt}
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-white/6 bg-white/[0.025] px-5 py-4 text-sm text-slate-300 backdrop-blur-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-cyan-300" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteCredits />
    </div>
  );
}
