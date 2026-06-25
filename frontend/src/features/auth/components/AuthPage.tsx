import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '@/shared/components';
import { SiteCredits } from '@/app/components';
import { AuthForm } from './AuthForm';
import { useAuthSession, type AuthMode } from '../hooks/useAuthSession';
import { routes } from '@/app/router/routes';

type AuthPageProps = {
  mode: AuthMode;
};

const AUTH_PAGE_META = {
  login: {
    title: 'Đăng nhập',
    description: 'Đăng nhập để tiếp tục nạp game, xem đơn hàng và quản lý ví của bạn.',
    benefits: ['Nạp game nhanh chóng', 'Theo dõi đơn hàng', 'Hỗ trợ 24/7'],
    switchPrompt: 'Chưa có tài khoản?',
    switchLabel: 'Đăng ký',
    switchHref: routes.register(),
  },
  register: {
    title: 'Tạo tài khoản',
    description: 'Tạo tài khoản để theo dõi đơn hàng, quản lý ví và xem lịch sử giao dịch ở một nơi.',
    benefits: ['Theo dõi đơn hàng', 'Quản lý số dư ví', 'Lưu lịch sử giao dịch'],
    switchPrompt: 'Đã có tài khoản?',
    switchLabel: 'Đăng nhập',
    switchHref: routes.login(),
  },
} as const satisfies Record<AuthMode, {
  title: string;
  description: string;
  benefits: string[];
  switchPrompt: string;
  switchLabel: string;
  switchHref: string;
}>;

export function AuthPage({ mode }: AuthPageProps) {
  const { isSubmitting, isAuthenticated, submitAuth } = useAuthSession();
  const navigate = useNavigate();
  const location = useLocation();
  const meta = AUTH_PAGE_META[mode];
  const redirectTo = resolveAuthRedirectPath(location.state);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const target = redirectTo && redirectTo !== routes.login() && redirectTo !== routes.register() ? redirectTo : routes.home();
    navigate(target, { replace: true });
  }, [navigate, redirectTo, isAuthenticated]);

  return (
    <div className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="relative flex w-full flex-1 items-center justify-center">
        <div className="mx-auto grid w-full max-w-[30rem] gap-6">
          <div className="text-center">
            <BrandLogo onClick={() => navigate(routes.home())} />
            <h1 className="mt-5 text-[clamp(2rem,4vw,2.65rem)] font-black leading-[0.96] tracking-tight text-white">
              {meta.title}
            </h1>
            <p className="mx-auto mt-3 max-w-[36ch] text-sm leading-6 gt-text-soft sm:text-[0.95rem]">{meta.description}</p>
          </div>

          <div className="rounded-[28px] border gt-border bg-[var(--gt-panel)] px-5 py-6 shadow-[0_28px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:px-7 sm:py-7">
            <div className="flex items-center gap-3 text-[0.82rem] gt-text-muted">
              <ShieldCheck size={15} className="shrink-0 text-cyan-300" />
              <span>Phiên đăng nhập được bảo vệ và lưu lịch sử giao dịch rõ ràng.</span>
            </div>

            <div className="mt-5">
              <AuthForm
                mode={mode}
                busy={isSubmitting}
                onSubmitAuth={submitAuth}
                switchHref={meta.switchHref}
                switchLabel={meta.switchLabel}
                switchPrompt={meta.switchPrompt}
              />
            </div>
          </div>

          <div className="rounded-[24px] border gt-border bg-[var(--gt-card)] px-5 py-4 text-sm gt-text-soft backdrop-blur-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              {meta.benefits.map((benefit) => (
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

function resolveAuthRedirectPath(state: unknown) {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const from = 'from' in state ? (state as { from?: unknown }).from : null;
  return typeof from === 'string' && from.trim().length > 0 ? from : null;
}
