import type { InputHTMLAttributes, ReactNode } from "react";
import { classNames } from "@/shared/lib/classNames";

export type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  wrapperClassName?: string;
  hint?: string;
  error?: string | null;
  trailing?: ReactNode;
};

export const inputClassName = `
  gt-input
  h-12
  px-4

  text-base
  text-[var(--gt-text)]
  placeholder:text-[var(--gt-text-disabled)]

  disabled:cursor-not-allowed
  disabled:opacity-70

  read-only:cursor-default

  [appearance:textfield]
  [&::-webkit-inner-spin-button]:m-0
  [&::-webkit-inner-spin-button]:appearance-none
  [&::-webkit-outer-spin-button]:m-0
  [&::-webkit-outer-spin-button]:appearance-none
`;

export function Field({
  label,
  className,
  wrapperClassName,
  hint,
  error,
  trailing,
  ...props
}: FieldProps) {
  const input = (
    <div className="gt-input-shell relative">
      <input
        className={classNames(
          inputClassName,
          trailing ? "pr-[52px]" : undefined,
          className,
        )}
        {...props}
      />

      {trailing ? (
        <span className="absolute inset-y-0 right-4 flex items-center">
          {trailing}
        </span>
      ) : null}
    </div>
  );

  if (!label) {
    return input;
  }

  return (
    <label className={classNames("mb-4 block", wrapperClassName)}>
      <span className="mb-2 block text-sm font-semibold gt-text-soft">
        {label}
      </span>

      {input}

      {error ? (
        <span className="mt-2 block text-sm text-rose-200">{error}</span>
      ) : hint ? (
        <span className="mt-2 block text-sm gt-text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
