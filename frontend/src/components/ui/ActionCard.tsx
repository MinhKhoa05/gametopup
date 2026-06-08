import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { classNames } from '@/lib/ui';

type ActionCardProps = {
  title: ReactNode;
  description?: ReactNode;
  icon: ReactNode;
  trailing?: ReactNode;
  centered?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

const BASE_CLASS =
  'grid w-full gap-4 rounded-2xl border border-white/5 bg-white/3 p-6 text-slate-200';

const INTERACTIVE_CLASS =
  'gt-interactive text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/25 hover:bg-cyan/10 hover:shadow-[0_0_18px_rgba(34,211,238,0.15)] focus-visible:border-cyan/25 focus-visible:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]';

export function ActionCard({
  title,
  description,
  icon,
  trailing,
  centered = false,
  disabled,
  className,
  onClick,
}: ActionCardProps) {
  const clickable = Boolean(onClick);
  const hasTrailing = trailing || clickable;

  const layoutClass = centered
    ? 'grid-cols-1 justify-items-center text-center'
    : hasTrailing
      ? 'grid-cols-[auto_minmax(0,1fr)_auto] items-center'
      : 'grid-cols-[auto_minmax(0,1fr)] items-center';

  const content = (
    <>
      {icon}

      <div className="min-w-0 space-y-1">
        <strong className="block text-base font-black leading-[1.2] text-white">
          {title}
        </strong>

        {description && (
          <span className="block text-sm leading-[1.45] text-slate-400">
            {description}
          </span>
        )}
      </div>

      {hasTrailing && (
        <div className={classNames('ml-auto flex items-center text-slate-300', centered && 'ml-0')}>
          {trailing ?? <ArrowRight size={18} />}
        </div>
      )}
    </>
  );

  const cardClassName = classNames(
    BASE_CLASS,
    layoutClass,
    clickable && INTERACTIVE_CLASS,
    !clickable && 'backdrop-blur-[12px]',
    disabled && 'cursor-not-allowed opacity-65 hover:translate-y-0 hover:border-white/5 hover:bg-white/3',
    className,
  );

  if (clickable) {
    return (
      <button type="button" disabled={disabled} onClick={onClick} className={cardClassName}>
        {content}
      </button>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}