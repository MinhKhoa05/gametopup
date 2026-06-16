export function AdminSkeleton({ rows }: { rows: number }) {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }).map((_, index) => (
        <span
          key={index}
          className="h-16 animate-pulse rounded-[18px] border border-white/[0.06] bg-white/[0.04]"
        />
      ))}
    </div>
  );
}

export function AdminListSkeleton({ ariaLabel, rows }: { ariaLabel: string; rows: number }) {
  return (
    <div className="grid gap-2" aria-busy="true" aria-label={ariaLabel}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-[18px] bg-white/5" />
      ))}
    </div>
  );
}
