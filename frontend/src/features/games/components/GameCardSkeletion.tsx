export function GameCardSkeleton() {
  return (
    <div
      className="w-full max-w-[180px]"
      aria-hidden="true"
    >
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--gt-card)] p-2">
        <div className="aspect-square animate-pulse rounded-xl bg-white/6" />
      </div>

      <div className="mt-2 h-4 w-24 mx-auto animate-pulse rounded-full bg-white/10" />
    </div>
  );
}