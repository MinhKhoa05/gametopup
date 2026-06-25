import type { ReactNode } from "react";
import { classNames } from "@/shared/lib/classNames";

type SectionHeadingProps = {
  title: ReactNode;

  eyebrow?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;

  className?: string;
  bodyClassName?: string;

  titleClassName?: string;
  descriptionClassName?: string;
  actionClassName?: string;
  eyebrowClassName?: string;
};

export function SectionHeading({
  title,
  eyebrow,
  description,
  action,
  children,

  className,
  bodyClassName,

  titleClassName,
  descriptionClassName,
  actionClassName,
  eyebrowClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={classNames(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className={classNames("grid min-w-0 gap-2", bodyClassName)}>
        {eyebrow ? (
          <span
            className={classNames(
              "text-xs font-semibold uppercase tracking-[0.14em] gt-text-muted",
              eyebrowClassName,
            )}
          >
            {eyebrow}
          </span>
        ) : null}

        <h2
          className={classNames(
            "m-0 text-[1.5rem] font-bold leading-tight tracking-[-0.02em] text-balance gt-text",
            titleClassName,
          )}
        >
          {title}
        </h2>

        {description ? (
          <p
            className={classNames(
              "max-w-2xl text-[15px] leading-7 gt-text-soft",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}

        {children}
      </div>

      {action ? (
        <div
          className={classNames(
            "flex shrink-0 items-start sm:items-center",
            actionClassName,
          )}
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}
