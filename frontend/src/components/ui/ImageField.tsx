import { useEffect, useRef, useState, type ChangeEvent, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';
import { DEFAULT_IMAGE_SRC, classNames } from '../../lib/ui';

type ImageFieldProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onChange'> & {
  accept?: string;
  fallbackSrc?: string;
  onChange?: (file: File | null) => void;
  src?: string;
};

function useImagePreview(src?: string, file?: File | null) {
  const [previewSrc, setPreviewSrc] = useState(src || DEFAULT_IMAGE_SRC);

  useEffect(() => {
    if (!file) {
      setPreviewSrc(src || DEFAULT_IMAGE_SRC);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, src]);

  return previewSrc;
}

export function ImageField({
  accept = 'image/png,image/jpeg,image/webp',
  alt = '',
  className,
  fallbackSrc = DEFAULT_IMAGE_SRC,
  onChange,
  src,
  ...props
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const previewSrc = useImagePreview(src, file);

  useEffect(() => {
    setFile(null);
  }, [src]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.currentTarget.files?.[0] ?? null;
    setFile(nextFile);
    onChange?.(nextFile);
    event.currentTarget.value = '';
  }

  function openPicker() {
    inputRef.current?.click();
  }

  const imageClassName = classNames('h-full w-full object-cover', className);
  const hasImage = Boolean(file || src);

  if (!onChange) {
    return (
      <img
        alt={alt}
        className={imageClassName}
        src={src || fallbackSrc}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = fallbackSrc;
        }}
        {...props}
      />
    );
  }

  return (
    <div
      className={classNames(
        'relative overflow-hidden rounded-2xl border border-dashed border-slate-400/20 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%),rgba(15,23,42,0.72)]',
        className,
      )}
    >
      <input ref={inputRef} accept={accept} aria-hidden className="sr-only" type="file" onChange={handleChange} />
      <button
        aria-label="Chọn ảnh"
        className="block h-full w-full text-left"
        type="button"
        onClick={openPicker}
      >
        {hasImage ? (
          <img
            alt={alt}
            className="h-full w-full object-cover"
            src={previewSrc}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackSrc;
            }}
            {...props}
          />
        ) : (
          <div className="grid min-h-44 place-items-center gap-2 px-6 py-8 text-center text-slate-400">
            <ImageOff size={28} />
            <span className="text-sm font-semibold">Bấm vào để chọn ảnh</span>
            <span className="text-xs text-slate-500">Ảnh sẽ hiển thị preview ngay sau khi chọn.</span>
          </div>
        )}
      </button>
    </div>
  );
}
