import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type PageHeroProps = {
  className?: string;
  actions?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  visual?: ReactNode;
  title: ReactNode;
};

export function PageHero({ actions, className, description, eyebrow, title, visual }: PageHeroProps) {
  return (
    <section
      className={classNames(
        'gt-panel relative overflow-hidden',
        'bg-[radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.12),transparent_30rem)]',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_30%,rgba(34,211,238,0.08),transparent_24rem)]" />

      <div className="relative flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          {visual ? <div className="shrink-0">{visual}</div> : null}

          <div className="min-w-0">
            {eyebrow ? (
              <p className="m-0 text-[0.72rem] font-black uppercase tracking-[0.2em] text-cyan-100/90">
                {eyebrow}
              </p>
            ) : null}

            <h1 className="mt-2 text-[clamp(1.9rem,4vw,3.6rem)] font-black leading-none tracking-[-0.06em] text-white">
              {title}
            </h1>

            {description ? (
              <p className="mt-2 max-w-3xl text-[0.96rem] leading-7 gt-text-muted">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? <div className="shrink-0 sm:pt-1">{actions}</div> : null}
      </div>
    </section>
  );
}
