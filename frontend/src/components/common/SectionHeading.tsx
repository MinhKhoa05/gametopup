import { classNames } from '../../lib/ui';

export function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={classNames('section-heading', className)}>{children}</div>;
}
