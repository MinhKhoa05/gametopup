import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ImageOff } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames';
import { DEFAULT_IMAGE_SRC } from '@/shared/lib/image';
import { ImageBox } from './ImageBox';

type ImagePickerProps = {
  accept?: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  onChange: (file: File | null) => void;
  previewClassName?: string;
  src?: string | null;
};

export function ImagePicker({
  accept = 'image/png,image/jpeg,image/webp',
  alt = '',
  className,
  fallbackSrc = DEFAULT_IMAGE_SRC,
  onChange,
  previewClassName,
  src,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(src ?? null);
  const hasImage = Boolean(previewSrc);

  useEffect(() => {
    setFile(null);
  }, [src]);

  useEffect(() => {
    if (!file) {
      setPreviewSrc(src ?? null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewSrc(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, src]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.currentTarget.files?.[0] ?? null;
    setFile(nextFile);
    onChange(nextFile);
    event.currentTarget.value = '';
  }

  function openPicker() {
    inputRef.current?.click();
  }

  return (
    <div
      className={classNames(
        'relative overflow-hidden rounded-2xl border border-dashed border-slate-400/20 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%),rgba(15,23,42,0.72)]',
        className,
      )}
    >
      <input ref={inputRef} accept={accept} aria-hidden className="sr-only" type="file" onChange={handleChange} />
      <button aria-label="Chọn ảnh" className="block h-full w-full text-left" type="button" onClick={openPicker}>
        {hasImage ? (
          <div className={classNames('min-h-44 w-full', previewClassName)}>
            <ImageBox alt={alt} fallbackSrc={fallbackSrc} src={previewSrc} className="h-full w-full object-cover" />
          </div>
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
