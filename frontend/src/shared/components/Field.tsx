import type { InputHTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  wrapperClassName?: string;
  hint?: string;
  error?: string | null;
  trailing?: ReactNode;
};

export const inputClassName =
  'w-full min-h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-slate-200 outline-none placeholder:text-slate-500 transition-all duration-200 hover:border-cyan/20 hover:bg-cyan/10 focus:border-cyan/80 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.075)] disabled:cursor-not-allowed disabled:opacity-70 read-only:cursor-default read-only:opacity-95 [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none';

export function Field({ label, className, wrapperClassName, hint, error, trailing, ...props }: FieldProps) {
  const input = <input className={classNames(inputClassName, trailing ? 'pr-[52px]' : '', className)} {...props} />;

  if (!label) {
    return input;
  }

  return (
    <label className={classNames('mb-4 block', wrapperClassName)}>
      <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span>
      <div className="relative">
        {input}
        {trailing ? <span className="absolute inset-y-0 right-3 grid place-items-center">{trailing}</span> : null}
      </div>
      {error ? (
        <span className="mt-2 block text-sm text-rose-200">{error}</span>
      ) : hint ? (
        <span className="mt-2 block text-sm text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}
