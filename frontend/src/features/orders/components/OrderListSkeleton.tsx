export function OrderListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="gt-border min-h-[88px] rounded-[20px] border bg-[var(--gt-card)] p-3 sm:min-h-[92px]"
        >
          <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
            <div className="size-12 animate-pulse rounded-[16px] bg-white/10 sm:size-[clamp(3rem,3.6vw,3.75rem)]" />

            <div className="flex min-w-0 flex-col justify-center">
              <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
              <div className="mt-2 h-3.5 w-52 max-w-full animate-pulse rounded bg-white/10" />
              <div className="mt-2 h-3 w-64 max-w-full animate-pulse rounded bg-white/10" />

              <div className="mt-3 flex items-center justify-between gap-2 sm:hidden">
                <div className="h-6 w-24 animate-pulse rounded-full bg-white/10" />
                <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
              </div>
            </div>

            <div className="hidden min-w-0 flex-col items-end justify-center gap-3 self-center sm:flex">
              <div className="h-6 w-24 animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
