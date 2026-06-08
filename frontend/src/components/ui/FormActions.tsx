import type { ReactNode } from 'react';
import { Button } from './Button';
import { classNames } from '@/lib/ui';

type FormActionsProps = {
  cancelLabel?: string;
  className?: string;
  disabled?: boolean;
  justify?: 'start' | 'end' | 'between';
  onCancel?: () => void;
  submitLabel: ReactNode;
  submitIcon?: ReactNode;
};

export function FormActions({
  cancelLabel = 'Hủy',
  className,
  disabled,
  justify = 'end',
  onCancel,
  submitLabel,
  submitIcon,
}: FormActionsProps) {
  return (
    <div className={classNames('mt-4 flex flex-wrap gap-2', justify === 'start' ? 'justify-start' : justify === 'between' ? 'justify-between' : 'justify-end', className)}>
      {onCancel ? <Button onClick={onCancel}>{cancelLabel}</Button> : null}
      <Button type="submit" variant="accent" disabled={disabled}>
        {submitIcon}
        {submitLabel}
      </Button>
    </div>
  );
}
