import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { classNames } from "@/shared/lib/classNames";

import { Button } from "./Button";

type DialogProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;

  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  headerAccessory?: ReactNode;
  footer?: ReactNode;

  loading?: boolean;
  maxWidthClassName?: string;
  panelClassName?: string;
  bodyClassName?: string;
};

export function Dialog({
  children,
  isOpen,
  onClose,
  title,
  description,
  icon,
  headerAccessory,
  footer,
  loading = false,
  maxWidthClassName = "max-w-3xl",
  panelClassName,
  bodyClassName,
}: DialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-[var(--gt-bg)]/82 p-2 backdrop-blur-md sm:p-4">
      <div className="flex min-h-[calc(100dvh-1rem)] items-start justify-center overflow-y-auto sm:min-h-[calc(100dvh-2rem)] sm:items-center">
        <button
          aria-label="Đóng"
          className="absolute inset-0 cursor-default"
          onClick={loading ? undefined : onClose}
          type="button"
        />

        <section
          aria-labelledby={titleId}
          aria-modal="true"
          className={classNames(
            "gt-panel relative z-10 flex w-full max-h-[calc(100dvh-1rem)] flex-col overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,.55)] sm:max-h-[calc(100dvh-2rem)]",
            maxWidthClassName,
            panelClassName,
          )}
          role="dialog"
        >
          <header className="flex flex-col gap-3 border-b gt-border px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {icon ? (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-[14px] border gt-border bg-[var(--gt-card)] text-[var(--gt-primary)] sm:size-10">
                  {icon}
                </div>
              ) : null}

              <div className="min-w-0">
                <h2
                  id={titleId}
                  className="text-[1.15rem] font-black leading-tight tracking-tight gt-text sm:text-[1.35rem]"
                >
                  {title}
                </h2>

                {description ? (
                  <p className="mt-1 text-sm leading-6 gt-text-muted">{description}</p>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
              {headerAccessory ? (
                <div className="shrink-0">{headerAccessory}</div>
              ) : null}

              <Button
                aria-label="Đóng"
                disabled={loading}
                onClick={onClose}
                size="icon"
                variant="ghost"
              >
                <X size={18} />
              </Button>
            </div>
          </header>

          <div className={classNames("min-h-0 overflow-y-auto p-4 sm:p-5", bodyClassName)}>{children}</div>

          {footer ? (
            <footer className="shrink-0 border-t gt-border px-4 py-4 sm:px-5">{footer}</footer>
          ) : null}
        </section>
      </div>
    </div>,
    document.body,
  );
}
