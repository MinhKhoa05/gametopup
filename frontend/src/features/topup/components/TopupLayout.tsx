import type { ReactNode } from 'react';
import { memo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Badge, IconBox, ImageBox, StepProgress, type ProgressStep } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';

export const TOPUP_ORDER_STEPS: readonly ProgressStep[] = [
  { icon: <span className="text-sm font-black tabular-nums">1</span>, title: 'Chọn gói' },
  { icon: <span className="text-sm font-black tabular-nums">2</span>, title: 'Hoàn tất' },
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
  return <StepProgress currentStep={currentStep} steps={TOPUP_ORDER_STEPS} className="mx-auto w-full max-w-[640px]" />;
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
    <div className="mx-auto grid max-w-[1480px] gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10" aria-busy="true" aria-label="Đang tải trang đặt hàng">
      <div className="rounded-[30px] border border-white/8 bg-[rgba(7,14,28,0.86)] p-5 shadow-[0_24px_70px_rgba(2,6,23,0.28)] sm:p-6 lg:p-7">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="h-20 w-20 animate-pulse rounded-[24px] bg-white/[0.04] sm:h-24 sm:w-24" aria-hidden="true" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-6 w-32 animate-pulse rounded-full bg-white/10" />
            <div className="h-10 w-72 max-w-full animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-[min(100%,28rem)] animate-pulse rounded-full bg-white/8" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="h-8 w-44 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-72 animate-pulse rounded-full bg-white/8" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`package-skeleton-${index}`} className="flex min-h-[280px] flex-col gap-3 rounded-[24px] border border-white/[0.06] bg-white/[0.025] p-3" aria-hidden="true">
                <div className="aspect-[1.05/0.82] rounded-[18px] bg-white/[0.05]" />
                <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/8" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/6" />
                <div className="mt-auto h-10 rounded-2xl bg-white/8" />
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-[28px] border border-white/8 bg-[rgba(7,13,25,0.92)] p-5 shadow-[0_22px_60px_rgba(2,6,23,0.3)] backdrop-blur-xl sm:p-6">
          <div className="mb-4 h-5 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`field-skeleton-${index}`} className="h-12 rounded-xl bg-white/6" aria-hidden="true" />
            ))}
            <div className="h-12 rounded-xl bg-white/8" />
          </div>
        </aside>
      </div>
    </div>
  );
}

export const TopupPageSkeletonMemo = memo(TopupPageSkeleton);
