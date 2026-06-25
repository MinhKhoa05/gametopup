import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { classNames } from "@/shared/lib/classNames";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex justify-center gap-2 pt-2"
      aria-label="Pagination"
    >
      <PagerButton
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronDown size={16} className="rotate-90" />
      </PagerButton>

      {getPages(currentPage, totalPages).map((page, index) =>
        page === "..." ? (
          <span
            key={index}
            className="inline-flex h-10 w-10 items-center justify-center text-slate-500"
          >
            ...
          </span>
        ) : (
          <PagerNumberButton
            key={page}
            active={page === currentPage}
            onClick={() => onPageChange(page)}
          >
            {page}
          </PagerNumberButton>
        ),
      )}

      <PagerButton
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronDown size={16} className="-rotate-90" />
      </PagerButton>
    </nav>
  );
}

function PagerButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function PagerNumberButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-bold",
        active
          ? "border-cyan/30 bg-cyan-400 text-slate-950"
          : "border-white/10 bg-white/5 text-slate-300",
      )}
    >
      {children}
    </button>
  );
}

function getPages(current: number, total: number): Array<number | "..."> {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, "...", total];
  }

  if (current >= total - 2) {
    return [1, "...", total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}