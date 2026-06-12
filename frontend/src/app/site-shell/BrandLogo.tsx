import { Gamepad2 } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames';
import { IconBox } from '@/shared/components';

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
        <IconBox
          size="sm"
          className={classNames(
            large ? 'h-12 w-12 rounded-[1rem]' : compact ? 'h-9 w-9 rounded-xl' : 'h-10 w-10',
            'transition-all duration-200 group-hover:bg-cyan/15 group-hover:shadow-[0_8px_24px_rgba(34,211,238,0.12)]',
          )}
        >
          <Gamepad2 size={large ? 28 : compact ? 20 : 24} />
        </IconBox>
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
            {title}
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
