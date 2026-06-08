import type { CSSProperties, ReactNode } from 'react';
import { memo } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { classNames } from '@/lib/ui';

export type StepProgressState = 'done' | 'active' | 'pending';

export type ProgressStep = {
  icon: ReactNode;
  title: string;
  state?: StepProgressState;
};

type StepProgressProps = {
  steps: readonly ProgressStep[];
  currentStep?: number;
  className?: string;
};

function getStepState(index: number, currentStep?: number, explicitState?: StepProgressState) {
  if (explicitState) {
    return explicitState;
  }

  if (!currentStep) {
    return 'pending';
  }

  const stepNumber = index + 1;

  if (stepNumber < currentStep) return 'done';
  if (stepNumber === currentStep) return 'active';
  return 'pending';
}

function StepProgressComponent({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={classNames('mx-auto grid w-full max-w-3xl gap-3', className)}>
      <div
        className="relative grid items-start gap-0 overflow-visible"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` } as CSSProperties}
      >
        {steps.map((step, index) => {
          if (index === steps.length - 1) return null;
          const stepState = getStepState(index, currentStep, step.state);

          const segmentClassName =
            stepState === 'done'
              ? 'bg-emerald-400/90'
              : stepState === 'active'
                ? 'bg-cyan-300/75'
                : 'bg-slate-300/55';

          return (
            <div
              key={`step-line-${index}`}
              className={classNames('absolute top-[22px] z-0 h-0.5 rounded-full transition-colors duration-300', segmentClassName)}
              style={{
                left: `calc(${((index + 0.5) / steps.length) * 100}% + 1.625rem)`,
                width: `calc(${100 / steps.length}% - 3.25rem)`,
              }}
              aria-hidden="true"
            />
          );
        })}

        {steps.map((step, index) => (
          <StepProgressItem key={`${step.title}-${index}`} step={step} stepState={getStepState(index, currentStep, step.state)} />
        ))}
      </div>
    </div>
  );
}

export const StepProgress = memo(StepProgressComponent);

function StepProgressItem({
  step,
  stepState,
}: {
  step: ProgressStep;
  stepState: StepProgressState;
}) {
  const circleClassName =
    stepState === 'done'
      ? 'border-emerald-300/40 bg-emerald-500 text-white shadow-[0_0_18px_rgba(34,197,94,0.18)] ring-1 ring-inset ring-emerald-200/15'
      : stepState === 'active'
        ? 'border-cyan-300/45 bg-cyan-500 text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.24)] ring-1 ring-inset ring-cyan-200/20'
        : 'border-white/8 bg-slate-700/30 text-slate-300 ring-1 ring-inset ring-white/5';

  return (
    <div className="relative grid items-start justify-items-center gap-1.5 px-1 text-center">
      <div
        className={classNames(
          'relative z-10 flex size-11 items-center justify-center rounded-full border transition-all duration-300 ease-out will-change-transform',
          circleClassName,
        )}
      >
        {stepState === 'done' ? (
          <motion.span
            className="flex items-center justify-center"
            initial={{ opacity: 0, rotate: -90, scale: 0.72 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <Check size={17} strokeWidth={3} />
          </motion.span>
        ) : (
          <span className={classNames('flex items-center justify-center transition-all duration-300 ease-out', stepState === 'active' && 'scale-[1.03]', stepState === 'pending' && 'opacity-90')}>
            {step.icon}
          </span>
        )}
      </div>

      <p
        className={classNames(
          'max-w-[9rem] text-[13px] font-bold leading-4 md:text-sm',
          stepState === 'pending' ? 'text-slate-500' : 'text-white',
        )}
      >
        {step.title}
      </p>
    </div>
  );
}
