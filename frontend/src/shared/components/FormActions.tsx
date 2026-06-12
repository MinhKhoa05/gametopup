import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';
import { Button } from './Button';

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
    <div
      className={classNames(
        'mt-4 flex flex-wrap gap-2',
        justify === 'start' ? 'justify-start' : justify === 'between' ? 'justify-between' : 'justify-end',
        className,
      )}
    >
      {onCancel ? <Button onClick={onCancel}>{cancelLabel}</Button> : null}
      <Button type="submit" variant="primary" disabled={disabled}>
        {submitIcon}
        {submitLabel}
      </Button>
    </div>
  );
}
