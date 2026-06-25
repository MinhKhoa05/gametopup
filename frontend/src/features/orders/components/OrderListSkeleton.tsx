export function OrderListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-[104px_1fr_auto]"
        >
          <div className="aspect-square animate-pulse rounded-xl bg-white/10" />

          <div className="space-y-3">
            <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-44 animate-pulse rounded bg-white/10" />
          </div>

          <div className="space-y-3">
            <div className="h-6 w-24 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}