import type { ReactNode } from 'react';
import { ImageField } from '../ui';

type GameOrderStepBannerProps = {
  afterTitle?: ReactNode;
  eyebrow: ReactNode;
  imageAlt: string;
  imageSrc: string;
  title: ReactNode;
};

export function GameOrderStepBanner({ afterTitle, eyebrow, imageAlt, imageSrc, title }: GameOrderStepBannerProps) {
  return (
    <div className="flex items-center gap-4 border-b gt-divider pb-5">
      <div className="h-[92px] w-[92px] flex-none overflow-hidden rounded-[14px] border gt-divider bg-slate-900">
        <ImageField src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0">
        <p className="gt-eyebrow">{eyebrow}</p>
        <h1 className="m-0 mb-2 text-[clamp(1.5rem,3vw,2.1rem)] font-black leading-[1.1] text-white">{title}</h1>
        {afterTitle}
      </div>
    </div>
  );
}
