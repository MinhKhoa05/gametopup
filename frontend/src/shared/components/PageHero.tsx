import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type PageHeroProps = {
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  visual?: ReactNode;
  title: ReactNode;
};

export function PageHero({ className, description, eyebrow, title, visual }: PageHeroProps) {
  return (
    <section
      className={classNames(
        'relative overflow-hidden rounded-[24px] border border-white/[0.08]',
        'bg-[radial-gradient(circle_at_12%_20%,rgba(34,211,238,0.14),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.9))]',
        'shadow-[0_24px_70px_rgba(2,6,23,0.28)]',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute right-12 bottom-0 h-24 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex items-center gap-4 px-6 py-7 sm:px-7 lg:px-8">
        <div className="flex items-center gap-4">
          {visual ? <div className="shrink-0">{visual}</div> : null}

          <div className="min-w-0">
            {eyebrow ? (
              <p className="m-0 text-[0.72rem] font-black uppercase tracking-[0.2em] text-cyan-100/90">
                {eyebrow}
              </p>
            ) : null}

            <h1 className="mt-2 text-[clamp(2.1rem,4vw,3.6rem)] font-black leading-none tracking-[-0.06em] text-white">
              {title}
            </h1>

            {description ? (
              <p className="mt-3 max-w-3xl text-[0.98rem] leading-7 text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

    </section>
  );
}
