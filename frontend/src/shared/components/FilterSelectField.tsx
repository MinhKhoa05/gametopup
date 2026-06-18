import type { ChangeEvent, ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames';

type FilterSelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  label?: ReactNode;
  onChange: (value: string) => void;
};

const BASE_CLASS =
  'gt-input-shell flex min-h-[3.75rem] items-center gap-3 px-4 gt-text-soft sm:px-5';

export function FilterSelectField({ children, className, icon, label, onChange, value, ...props }: FilterSelectFieldProps) {
  const hasMeta = Boolean(label || icon);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value);
  }

  return (
    <label className={classNames(BASE_CLASS, className)}>
      {icon ? <span className="gt-icon-box gt-icon-box-primary inline-flex size-8 items-center justify-center rounded-[13px]">{icon}</span> : null}

      {hasMeta ? (
        <div className="grid min-w-0 flex-1 gap-0.5">
          {label ? <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] gt-text-disabled">{label}</span> : null}
          <select
            className="gt-input w-full appearance-none p-0 pr-7 text-sm font-semibold focus:ring-0"
            value={value}
            onChange={handleChange}
            {...props}
          >
            {children}
          </select>
        </div>
      ) : (
        <select
          className="gt-input w-full appearance-none p-0 pr-7 text-sm font-semibold focus:ring-0"
          value={value}
          onChange={handleChange}
          {...props}
        >
          {children}
        </select>
      )}

      <ChevronDown size={16} className="pointer-events-none gt-text-muted" />
    </label>
  );
}
