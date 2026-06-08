import { useState, type ReactNode } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ShieldCheck, Tag, Zap } from 'lucide-react';
import { useAuthSession } from '@/features/auth/hooks/auth.hooks';
import type { AuthMode } from '@/features/auth/hooks/auth.hooks';
import { classNames } from '@/lib/ui';
import { SITE } from '@/config/site';
import { AuthForm } from '@/features/auth/components/AuthForm';

export function AuthPage() {
  const { isAuthSubmitting, submitAuth } = useAuthSession();
  const [activeMode, setActiveMode] = useState<AuthMode>('login');
  const [direction, setDirection] = useState(1);

  const switchMode = (nextMode: AuthMode) => {
    if (nextMode === activeMode) return;
    setDirection(nextMode === 'register' ? 1 : -1);
    setActiveMode(nextMode);
  };

  return (
    <div className="w-full px-4 pb-24 pt-8 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8 lg:pt-12">
      <section className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[28px] border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <div
          className={
            'absolute inset-0 bg-[linear-gradient(100deg,rgba(7,17,31,0.96)_0%,rgba(7,17,31,0.9)_45%,rgba(7,17,31,0.58)_100%),url("https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1600&q=80")] bg-cover bg-center'
          }
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.13),transparent_28%),radial-gradient(circle_at_85%_40%,rgba(34,211,238,0.1),transparent_18%)]" />

        <div className="relative grid min-h-[600px] w-full lg:grid-cols-[1.45fr_1fr] xl:grid-cols-[1.5fr_0.98fr]">
          <div className="flex flex-col justify-between px-5 py-5 sm:px-8 sm:py-7 lg:px-6 lg:py-8">
            <div className="max-w-[34rem]">
              <p className="inline-flex rounded-full border border-cyan/20 bg-cyan/10 px-4 py-1 text-[0.7rem] font-bold uppercase tracking-[0.24em] text-cyan-100">
                Đại lý nạp game uy tín số 1
              </p>

              <h1 className="mt-4 text-[clamp(2.1rem,4.4vw,4rem)] font-black leading-[0.92] tracking-tight text-white">
                Nạp game
                <br />
                <span className="text-cyan">tiết kiệm hơn</span>
              </h1>

              <p className="mt-4 max-w-[31rem] text-[0.88rem] leading-7 text-slate-300 sm:text-[0.94rem]">
                Nạp game qua đại lý {SITE.name} giúp bạn tiết kiệm chi phí, an toàn và nhận hàng nhanh chóng.
              </p>
            </div>

            <div className="mt-6 grid max-w-[30rem] gap-3">
              <FeatureRow
                icon={<Tag size={18} />}
                title="Giá rẻ hơn đến 15%"
                description="Chiết khấu cao hơn so với cổng nạp gốc"
              />
              <FeatureRow
                icon={<ShieldCheck size={18} />}
                title="An toàn tuyệt đối"
                description="Bảo mật thông tin - Giao dịch an toàn"
              />
              <FeatureRow
                icon={<Zap size={18} />}
                title="Xử lý siêu nhanh"
                description="Nạp thành công chỉ từ 5 - 15 phút"
              />
            </div>
          </div>

          <div className="flex items-stretch justify-start px-5 py-5 sm:px-8 sm:py-7 lg:pl-0 lg:pr-6 lg:py-8 xl:pr-8">
            <div className="flex min-h-[560px] w-full max-w-[498px] flex-col overflow-hidden rounded-[22px] border border-white/8 bg-[rgba(12,20,36,0.84)] p-4.5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-5">
              <LayoutGroup>
                <div className="mx-auto flex w-full max-w-[350px] items-center justify-center gap-10 border-b border-white/8">
                  <AuthTabButton active={activeMode === 'login'} onClick={() => switchMode('login')}>
                    Đăng nhập
                  </AuthTabButton>
                  <AuthTabButton active={activeMode === 'register'} onClick={() => switchMode('register')}>
                    Đăng ký
                  </AuthTabButton>
                </div>
              </LayoutGroup>

              <div className="relative mt-4 flex min-h-0 flex-1 overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="sync">
                  <motion.div
                    key={activeMode}
                    className="absolute inset-0 flex"
                    custom={direction}
                    variants={formSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                  >
                    <AuthForm
                      mode={activeMode}
                      busy={isAuthSubmitting}
                      onSubmitAuth={submitAuth}
                      onSwitchMode={switchMode}
                      className="flex h-full flex-1 flex-col"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-cyan/15 bg-cyan/10 text-cyan">
        {icon}
      </div>
      <div>
        <div className="text-[0.9rem] font-bold text-white">{title}</div>
        <div className="text-[0.84rem] text-slate-300">{description}</div>
      </div>
    </div>
  );
}

function AuthTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'relative -mb-px px-4 pb-3 text-[0.86rem] font-bold transition-colors duration-200',
        active ? 'text-cyan' : 'text-slate-400 hover:text-white',
      )}
    >
      {children}
      {active ? (
        <motion.span
          layoutId="auth-tab-indicator"
          className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-cyan"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      ) : null}
    </button>
  );
}

const formSlideVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 24 : -24,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -24 : 24,
  }),
};
