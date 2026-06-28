export function GamePackagePageSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1480px] gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10" aria-busy="true" aria-label="Đang tải trang đặt hàng">
      <div className="gt-panel rounded-[30px] p-5 sm:p-6 lg:p-7">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="h-20 w-20 animate-pulse rounded-[24px] bg-white/[0.04] sm:h-24 sm:w-24" aria-hidden="true" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-6 w-32 animate-pulse rounded-full bg-white/10" />
            <div className="h-10 w-72 max-w-full animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-[min(100%,28rem)] animate-pulse rounded-full bg-white/8" />
          </div>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,6.9fr)_minmax(0,3.1fr)] lg:gap-8">
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="h-8 w-44 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-72 animate-pulse rounded-full bg-white/8" />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,214px))] justify-start gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`package-skeleton-${index}`} className="flex aspect-[0.82/1] w-full max-w-[214px] flex-col gap-3 rounded-[20px] border border-white/[0.06] bg-white/[0.025] p-2" aria-hidden="true">
                <div className="aspect-square rounded-[16px] bg-white/[0.05]" />
                <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/8" />
                <div className="h-8 w-28 rounded-[12px] bg-white/8" />
                <div className="h-3 w-20 rounded-full bg-white/6" />
              </div>
            ))}
          </div>
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="gt-panel rounded-[28px] p-4 backdrop-blur-xl sm:p-5">
            <div className="grid gap-5">
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 shrink-0 rounded-[16px] bg-white/[0.06] sm:h-[72px] sm:w-[72px]" />
                <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                  <div className="h-4 w-40 max-w-full animate-pulse rounded-full bg-white/10" />
                  <div className="h-3.5 w-24 animate-pulse rounded-full bg-white/8" />
                </div>
              </div>
              <div className="h-px w-full bg-[var(--gt-border)] opacity-80" />
              <div className="space-y-3">
                <div className="h-8 w-full rounded-xl bg-white/6" />
                <div className="h-5 w-full rounded-xl bg-white/6" />
                <div className="h-5 w-full rounded-xl bg-white/6" />
              </div>
              <div className="h-12 rounded-xl bg-white/8" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
