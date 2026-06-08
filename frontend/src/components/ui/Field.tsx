import type { InputHTMLAttributes } from 'react';
import { classNames } from '@/lib/ui';

export const inputClassName =
  'w-full min-h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-slate-200 outline-none ' +
  'placeholder:text-slate-500 transition-all duration-200 hover:border-cyan/25 hover:bg-cyan/10 ' +
  'focus:border-cyan focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)] disabled:cursor-not-allowed ' +
  'disabled:opacity-70 read-only:cursor-default read-only:opacity-95 [appearance:textfield] ' +
  '[&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none ' +
  '[&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  wrapperClassName?: string;
};

export function Field({ label, className, wrapperClassName, ...props }: FieldProps) {
  const input = <input className={classNames(inputClassName, className)} {...props} />;

  if (!label) return input;

  return (
    <label className={classNames('mb-4 block', wrapperClassName)}>
      <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span>
      {input}
    </label>
  );
}
