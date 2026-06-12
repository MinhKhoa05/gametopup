import type { ReactNode } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Badge, IconBox, ImageBox, StepProgress, type ProgressStep } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';

export const TOPUP_ORDER_STEPS: readonly ProgressStep[] = [
  { icon: <span className="text-sm font-black tabular-nums">1</span>, title: 'Chọn gói & nhập thông tin' },
  { icon: <span className="text-sm font-black tabular-nums">2</span>, title: 'Đặt hàng thành công' },
] as const;

export function TopupBreadcrumb({ gameName }: { gameName: string }) {
  return (
    <div className="mb-5 flex items-center gap-2 text-sm text-slate-400">
      <span className="inline-flex items-center gap-2">
        <Home size={16} className="text-slate-500" />
        <span>Đơn hàng</span>
      </span>
      <ChevronRight size={14} />
      <span className="font-bold text-white">{gameName}</span>
    </div>
  );
}

export function TopupStepProgress({ currentStep }: { currentStep: 1 | 2 }) {
  return <StepProgress currentStep={currentStep} steps={TOPUP_ORDER_STEPS} className="max-w-[640px]" />;
}

export function TopupHeroBanner({
  afterTitle,
  eyebrow,
  imageAlt,
  imageSrc,
  title,
}: {
  afterTitle?: ReactNode;
  eyebrow: string;
  imageAlt: string;
  imageSrc: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-4 border-b gt-divider pb-5">
      <div className="h-[88px] w-[88px] flex-none overflow-hidden rounded-[14px] border gt-divider bg-slate-900">
        <ImageBox src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <Badge variant="accent" className="uppercase tracking-[0.18em]">
          {eyebrow}
        </Badge>
        <div className="space-y-1.5">
          <h1 className="m-0 text-[clamp(1.35rem,2.3vw,1.95rem)] font-black leading-[1.08] tracking-tight text-white">
            {title}
            <span className="block text-cyan">nhanh, rõ và đúng chuẩn</span>
          </h1>
          {afterTitle}
        </div>
      </div>
    </div>
  );
}

export function TopupSectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex min-h-7 items-center gap-2.5">
      <IconBox size="sm" className="h-7 w-7 rounded-lg">
        {icon}
      </IconBox>
      <h3 className="m-0 text-xs font-bold tracking-[0.13em] text-slate-200">{title}</h3>
    </div>
  );
}

export function TopupDetailSection({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <div className="gt-panel-soft grid gap-3 rounded-xl p-3.5">
      <TopupSectionTitle icon={icon} title={title} />
      {children}
    </div>
  );
}

export function TopupDetailRow({
  compact = false,
  icon,
  label,
  last = false,
  value,
}: {
  compact?: boolean;
  icon: ReactNode;
  label: string;
  last?: boolean;
  value: ReactNode;
}) {
  return (
    <div
      className={classNames(
        compact ? 'grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-3 px-4 py-3' : 'grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-3 px-4 py-2.5',
        !last && 'border-b gt-divider',
      )}
    >
      <span className={classNames('inline-flex items-center gap-2 text-xs font-medium text-slate-400', compact && 'text-sm font-bold text-slate-200')}>
        {icon}
        {label}
      </span>
      {value}
    </div>
  );
}

export function TopupStatusItem({
  badgeClassName,
  badgeLabel,
  description,
  hint,
  icon,
  iconClassName,
  iconCircle = false,
  title,
}: {
  badgeClassName: string;
  badgeLabel: string;
  description: string;
  hint?: string;
  icon: ReactNode;
  iconClassName?: string;
  iconCircle?: boolean;
  title: string;
}) {
  return (
    <div className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-3.5">
      <IconBox size="sm" circle={iconCircle} className={classNames('h-10 w-10', iconClassName)}>
        {icon}
      </IconBox>
      <div className="pt-px">
        <div className="mb-1.5 flex items-center gap-2">
          <strong className="text-sm font-bold text-white">{title}</strong>
          <span className={classNames('rounded-full px-2.5 py-1 text-xs font-bold', badgeClassName)}>{badgeLabel}</span>
        </div>
        <p className="m-0 text-sm leading-[1.45] text-slate-300">{description}</p>
        {hint ? <small className="text-xs text-slate-400">{hint}</small> : null}
      </div>
    </div>
  );
}

export function TopupPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8" aria-busy="true" aria-label="Đang tải trang đặt hàng">
      <div className="mb-5 flex items-center gap-2 text-sm text-slate-400">
        <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="gt-surface p-5 sm:p-6">
        <div className="mx-auto mb-5 grid w-full max-w-[640px] grid-cols-2 gap-2.5 sm:gap-4" aria-hidden="true">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`step-skeleton-${index}`}
              className={classNames(
                'relative flex flex-col items-center gap-1.5 text-center text-slate-500',
                index === 0 &&
                  "after:absolute after:top-[13px] after:left-[calc(50%+24px)] after:right-[calc(-50%+24px)] after:h-0.5 after:rounded-full after:bg-white/6 after:content-['']",
              )}
            >
              <span
                className={classNames(
                  'relative z-10 inline-flex size-7 items-center justify-center rounded-full border border-white/8 bg-slate-700/30 text-sm font-black text-slate-300 ring-1 ring-inset ring-white/5',
                  index === 0 && 'bg-cyan-500 text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.24)] ring-cyan-200/20',
                )}
              >
                <span className="animate-pulse text-transparent">0</span>
              </span>
              <small className="h-3 w-20 animate-pulse rounded-full bg-white/10 text-transparent" />
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4">
            <div className="h-56 animate-pulse rounded-2xl bg-white/5" />
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3.5">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={`package-skeleton-${index}`} className="relative flex min-h-48 flex-col items-stretch rounded-lg border border-white/[0.06] bg-ink-lighter p-2.5 text-center md:min-h-[210px]" aria-hidden="true">
                  <div className="mb-2.5 aspect-[1/0.82] overflow-hidden rounded-md bg-ink-dark">
                    <div className="h-full w-full animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.03)_8%,rgba(255,255,255,0.12)_18%,rgba(255,255,255,0.03)_33%)] bg-[length:200%_100%]" />
                  </div>
                  <div className="mb-2 h-4 w-3/4 animate-pulse rounded-full bg-white/8" />
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/6" />
                  <div className="mt-auto h-8 w-full rounded-md bg-white/8" />
                </div>
              ))}
            </div>
          </div>
          <aside className="sticky top-24">
            <div className="gt-panel gt-panel-soft rounded-lg p-4">
              <div className="mb-4 h-5 w-40 animate-pulse rounded-full bg-white/10" />
              <div className="grid gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`field-skeleton-${index}`} className="h-12 rounded-xl bg-white/6" aria-hidden="true" />
                ))}
                <div className="h-12 rounded-xl bg-white/8" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
