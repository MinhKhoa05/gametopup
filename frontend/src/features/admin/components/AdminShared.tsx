export function AdminSkeleton({ rows }: { rows: number }) {
  return (
    <div className="grid gap-2.5" aria-busy="true" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }).map((_, index) => (
        <span
          key={index}
          className="h-[70px] animate-pulse rounded-xl bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.08),rgba(255,255,255,0.04))] bg-[length:220%_100%]"
        />
      ))}
    </div>
  );
}
