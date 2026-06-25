import type { ReactNode } from "react";

import { classNames } from "@/shared/lib/classNames";

type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={classNames(
        "gt-panel grid gap-3 px-6 py-10 text-center",
        className,
      )}
    >
      <h2 className="text-[1.15rem] font-extrabold leading-tight gt-text">
        {title}
      </h2>

      {description && (
        <p className="text-sm leading-6 gt-text-muted">{description}</p>
      )}

      {children}
    </div>
  );
}
