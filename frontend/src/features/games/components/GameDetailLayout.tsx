export function GameDetailPageSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1480px] gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10" aria-busy="true" aria-label="Đang tải trang đặt hàng">
      <div className="rounded-[30px] border border-white/8 bg-[rgba(7,14,28,0.86)] p-5 shadow-[0_24px_70px_rgba(2,6,23,0.28)] sm:p-6 lg:p-7">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="h-20 w-20 animate-pulse rounded-[24px] bg-white/[0.04] sm:h-24 sm:w-24" aria-hidden="true" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-6 w-32 animate-pulse rounded-full bg-white/10" />
            <div className="h-10 w-72 max-w-full animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-[min(100%,28rem)] animate-pulse rounded-full bg-white/8" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="h-8 w-44 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-72 animate-pulse rounded-full bg-white/8" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`package-skeleton-${index}`} className="flex min-h-[280px] flex-col gap-3 rounded-[24px] border border-white/[0.06] bg-white/[0.025] p-3" aria-hidden="true">
                <div className="aspect-[1.05/0.82] rounded-[18px] bg-white/[0.05]" />
                <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/8" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/6" />
                <div className="mt-auto h-10 rounded-2xl bg-white/8" />
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-[28px] border border-white/8 bg-[rgba(7,13,25,0.92)] p-5 shadow-[0_22px_60px_rgba(2,6,23,0.3)] backdrop-blur-xl sm:p-6">
          <div className="mb-4 h-5 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`field-skeleton-${index}`} className="h-12 rounded-xl bg-white/6" aria-hidden="true" />
            ))}
            <div className="h-12 rounded-xl bg-white/8" />
          </div>
        </aside>
      </div>
    </div>
  );
}
