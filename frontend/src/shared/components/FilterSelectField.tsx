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
  'flex min-h-[3.75rem] items-center gap-3 rounded-[22px] border border-white/10 bg-[rgba(7,16,31,0.72)] px-4 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.9)] focus-within:border-cyan/60 focus-within:bg-[rgba(15,29,51,0.9)] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)] sm:px-5';

export function FilterSelectField({ children, className, icon, label, onChange, value, ...props }: FilterSelectFieldProps) {
  const hasMeta = Boolean(label || icon);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value);
  }

  return (
    <label className={classNames(BASE_CLASS, className)}>
      {icon ? <span className="inline-flex size-8 items-center justify-center rounded-[13px] border border-cyan/15 bg-cyan/10 text-cyan-50">{icon}</span> : null}

      {hasMeta ? (
        <div className="grid min-w-0 flex-1 gap-0.5">
          {label ? <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span> : null}
          <select
            className="w-full appearance-none border-0 bg-transparent p-0 pr-7 text-sm font-semibold text-white outline-none focus:ring-0"
            value={value}
            onChange={handleChange}
            {...props}
          >
            {children}
          </select>
        </div>
      ) : (
        <select
          className="w-full appearance-none border-0 bg-transparent p-0 pr-7 text-sm font-semibold text-white outline-none focus:ring-0"
          value={value}
          onChange={handleChange}
          {...props}
        >
          {children}
        </select>
      )}

      <ChevronDown size={16} className="pointer-events-none text-slate-500" />
    </label>
  );
}
