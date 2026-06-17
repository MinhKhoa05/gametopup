import { classNames } from '@/shared/lib/classNames';
import brandLogoSrc from '@/assets/brand/logo.svg';

type BrandLogoProps = {
  className?: string;
  collapsed?: boolean;
  adminDot?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  showTextOnMobile?: boolean;
  subtitle?: string;
  title: string;
};

export function BrandLogo({
  className,
  collapsed = false,
  onClick,
  adminDot = false,
  size = 'md',
  showTextOnMobile = false,
  subtitle,
  title,
}: BrandLogoProps) {
  const compact = size === 'sm';
  const large = size === 'lg';

  return (
    <button
      type="button"
      className={classNames(
        'group flex items-center border-0 bg-transparent p-0 text-left transition-transform duration-200 hover:-translate-y-0.5',
        collapsed ? 'justify-center' : large ? 'gap-4' : compact ? 'gap-2.5' : 'gap-3',
        className,
      )}
      onClick={onClick}
    >
      <span className="relative inline-flex">
        <img
          src={brandLogoSrc}
          alt=""
          className={classNames(
            'block shrink-0 object-contain transition-transform duration-200 group-hover:scale-[1.01]',
            large ? 'h-12 w-12' : compact ? 'h-9 w-9' : 'h-10 w-10',
          )}
        />
        {adminDot ? (
          <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-[#071427] bg-cyan shadow-[0_0_0_3px_rgba(34,211,238,0.14)]" />
        ) : null}
      </span>
      {collapsed ? null : (
        <span className={classNames('min-w-0', showTextOnMobile ? 'block' : 'hidden lg:block')}>
          <strong
            className={classNames(
              'block leading-tight text-white',
              showTextOnMobile ? 'break-words' : 'truncate',
              large ? 'text-[1.15rem] font-extrabold tracking-[-0.02em]' : compact ? 'text-base font-bold' : 'text-lg font-bold',
            )}
          >
            <span className="text-white">Game</span>
            <span className="text-cyan-300">TopUp</span>
          </strong>
          {subtitle ? (
            <small
              className={classNames(
                'block font-medium leading-tight text-cyan-50',
                showTextOnMobile ? 'break-words' : 'truncate',
                large ? 'text-sm' : compact ? 'text-[0.7rem]' : 'text-sm',
              )}
            >
              {subtitle}
            </small>
          ) : null}
        </span>
      )}
    </button>
  );
}
