import { Gamepad2, WalletCards, Zap } from 'lucide-react';

type HowToTopupSectionProps = {
  hasLogin: boolean;
};

const steps = [
  {
    id: 1,
    title: '1. Chọn game',
    desc: 'Tìm tựa game và chọn gói nạp phù hợp.',
    icon: <Gamepad2 size={24} />,
  },
  {
    id: 2,
    title: '2. Nhập ID',
    desc: 'Cung cấp UID hoặc thông tin tài khoản.',
    icon: <Zap size={24} />,
  },
  {
    id: 3,
    title: '3. Thanh toán',
    desc: 'Sử dụng số dư ví và nhận gói nạp tức thì.',
    icon: <WalletCards size={24} />,
  },
] as const;

export function HowToTopupSection({ hasLogin }: HowToTopupSectionProps) {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-extrabold text-white">Cách Thức Nạp Game</h2>
      {hasLogin ? (
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.id}
              className="flex items-center gap-4 rounded-2xl border border-white/5 bg-ink-lighter p-6 text-left transition-all duration-300"
            >
              <div className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-cyanline/10 text-cyanline">
                {step.icon}
              </div>
              <div className="space-y-1">
                <strong className="block text-lg text-white">{step.title}</strong>
                <span className="block text-slate-400">{step.desc}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {steps.map((step) => (
            <article
              key={step.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-ink-lighter p-6 text-center transition-all duration-300 md:items-center"
            >
              <div className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-cyanline/10 text-cyanline">
                {step.icon}
              </div>
              <div className="space-y-1">
                <strong className="block text-lg text-white">{step.title}</strong>
                <span className="block text-slate-400">{step.desc}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
