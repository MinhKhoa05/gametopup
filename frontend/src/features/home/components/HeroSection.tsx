import type { ReactNode } from "react";
import { SITE_IMAGES } from "@/app/config/site";

type HeroSectionProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function HeroSection({
  eyebrow,
  title,
  description,
  actions,
}: HeroSectionProps) {
  return (
    <section className="gt-panel overflow-hidden rounded-[28px]">
      <div className="grid items-center gap-10 p-6 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-8">
        <div className="grid gap-5">
          <div className="grid gap-4">
            {eyebrow && (
              <strong className="text-[1.8rem] font-bold tracking-[-0.02em]">
                {eyebrow}
              </strong>
            )}

            <h1 className="max-w-xl text-4xl font-bold leading-tight">
              {title}
            </h1>

            {description && (
              <p className="max-w-lg text-base leading-7 gt-text-soft">
                {description}
              </p>
            )}
          </div>

          {actions}
        </div>

        <div className="flex justify-center lg:justify-end">
          <img
            src={SITE_IMAGES.home.heroIllustration}
            alt="GameTopUp"
            className="w-full max-w-[460px] object-contain"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}