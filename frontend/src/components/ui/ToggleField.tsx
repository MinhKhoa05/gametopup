import type { ReactNode } from 'react';
import { classNames } from '@/lib/ui';

type ToggleFieldProps = {
  checked: boolean;
  className?: string;
  description?: ReactNode;
  disabled?: boolean;
  label: ReactNode;
  onChange: (checked: boolean) => void;
};

export function ToggleField({ checked, className, description, disabled, label, onChange }: ToggleFieldProps) {
  return (
    <label className={classNames('flex items-start gap-2 font-semibold text-slate-200', className)}>
      <input
        checked={checked}
        disabled={disabled}
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 shrink-0 accent-cyan"
      />
      <span className="grid gap-1 leading-6">
        <span>{label}</span>
        {description ? <span className="font-normal text-slate-400">{description}</span> : null}
      </span>
    </label>
  );
}
