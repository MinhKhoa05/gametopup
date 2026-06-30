import { ImgHTMLAttributes } from 'react';
import { classNames } from '@/shared/lib/classNames';
import { DEFAULT_IMAGE_SRC } from '@/shared/lib/image';

type ImageBoxProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  fallbackSrc?: string;
  src?: string | null;
};

export function ImageBox({
  alt = '',
  className,
  decoding = 'async',
  fallbackSrc = DEFAULT_IMAGE_SRC,
  src,
  ...props
}: ImageBoxProps) {
  return (
    <img
      alt={alt}
      className={classNames('h-full w-full object-cover', className)}
      decoding={decoding}
      src={src || fallbackSrc}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = fallbackSrc;
      }}
      {...props}
    />
  );
}
