import { classNames } from '../../lib/ui';

export function Field({
  className,
  label,
  min,
  readOnly,
  required,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  className?: string;
  label: string;
  min?: number;
  readOnly?: boolean;
  required?: boolean;
  value: string;
  onChange?: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className={classNames('gametopup-field', className)}>
      <span className="gametopup-field__label">{label}</span>
      <input
        className="gametopup-input"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        min={min}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        type={type}
      />
    </label>
  );
}
