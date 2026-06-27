export function GameCardSkeleton() {
  return (
    <div
      className="w-full"
      aria-hidden="true"
    >
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--gt-card)] p-2">
        <div className="aspect-square animate-pulse rounded-xl bg-white/6" />
      </div>

      <div className="mt-3 flex min-h-[3rem] items-start justify-center px-1 pt-1">
        <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}
