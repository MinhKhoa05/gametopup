import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type PageHeroProps = {
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  illustration?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
};

export function PageHero({ children, className, description, illustration, icon, title }: PageHeroProps) {
  const hasIllustration = Boolean(illustration);

  return (
    <section
      className={classNames(
        'gt-surface relative overflow-hidden rounded-[18px] border border-cyan/10 bg-[linear-gradient(180deg,rgba(7,16,31,0.88),rgba(4,10,22,0.96))] px-5 py-4 shadow-[0_12px_30px_rgba(2,6,23,0.18)] sm:px-6 sm:py-5 lg:px-7 lg:py-5',
        className,
      )}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[14rem] w-[14rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/10 blur-[96px] lg:h-[17rem] lg:w-[17rem]" />
      <div className="pointer-events-none absolute left-[10%] top-[16%] h-24 w-24 rounded-full bg-cyan/10 blur-[64px] mix-blend-screen" />
      <div className="pointer-events-none absolute inset-x-[30%] top-[54%] h-px bg-gradient-to-r from-cyan/0 via-cyan/18 to-cyan/0" />
      <div className="pointer-events-none absolute inset-x-[22%] bottom-[12%] h-10 rounded-full bg-cyan/8 blur-[36px] mix-blend-screen" />

      <div
        className={classNames(
          'relative grid gap-5 pt-1 lg:items-center lg:gap-6 lg:pt-2',
          hasIllustration && 'lg:grid-cols-[minmax(0,1.18fr)_minmax(240px,0.82fr)]',
        )}
      >
        <div className="flex items-start gap-4 pt-1 lg:max-w-[760px] lg:items-center lg:self-start lg:pl-2 lg:pt-0">
          {icon ? icon : null}

          <div className="grid gap-5 pt-0.5">
            <h1 className="m-0 text-[clamp(2.4rem,3.05vw,3.45rem)] font-black leading-[0.96] tracking-[-0.055em] text-white text-balance">
              {title}
            </h1>
            {description ? <div className="m-0 max-w-[640px] text-[0.98rem] leading-7 text-slate-400">{description}</div> : null}
          </div>
        </div>

        {hasIllustration ? (
          <div className="relative flex min-h-[168px] items-center justify-center overflow-visible lg:min-h-[192px] lg:justify-self-center lg:pt-0">
            <div className="pointer-events-none absolute left-[50%] top-[52%] h-[13rem] w-[13rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/14 blur-[78px]" />
            <div className="pointer-events-none absolute left-[18%] top-[18%] h-[4.5rem] w-[4.5rem] rounded-full bg-cyan/10 blur-[56px] mix-blend-screen" />
            <div className="pointer-events-none absolute right-[18%] top-[18%] h-12 w-12 rounded-full bg-blue-400/8 blur-[34px] mix-blend-screen" />
            <div className="pointer-events-none absolute left-[20%] top-[48%] h-px w-[58%] bg-gradient-to-r from-cyan/0 via-cyan/20 to-cyan/0" />

            {illustration}
          </div>
        ) : null}
      </div>
    </section>
  );
}
