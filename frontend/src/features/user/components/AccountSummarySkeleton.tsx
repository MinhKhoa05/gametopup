export function AccountSummarySkeleton() {
  return (
    <div className="grid gap-0 px-4 pt-5 pb-6 md:p-5 lg:px-6 lg:pt-5 lg:pb-6" aria-busy="true" aria-label="Đang tải tài khoản">
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.15fr)_1px_minmax(0,1fr)] lg:gap-0">
        <div className="grid grid-cols-1 items-center gap-4 pr-0 md:grid-cols-[auto_minmax(0,1fr)] md:justify-items-start lg:pr-6">
          <div className="grid h-24 w-24 place-items-center rounded-full border border-cyan/20 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.24),transparent_55%),rgba(34,211,238,0.1)] shadow-[inset_0_0_28px_rgba(34,211,238,0.08)]">
            <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />
          </div>

          <div className="grid min-w-0 gap-2">
            <div className="h-7 w-full max-w-56 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-full max-w-72 animate-pulse rounded-full bg-white/5" />
            <div className="flex flex-wrap gap-2.5">
              <div className="h-6 w-32 animate-pulse rounded-full bg-white/10" />
              <div className="h-6 w-28 animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="text-sm text-slate-400">Đang tải tài khoản...</div>
          </div>
        </div>

        <div className="h-px w-full self-stretch bg-slate-400/15 lg:h-auto lg:w-px" />

        <div className="grid grid-cols-1 items-center gap-0 pl-0 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:pl-6">
          <div className="h-24 w-full animate-pulse rounded-2xl bg-white/5 md:min-w-[240px]" />
          <div className="my-2 h-px w-full justify-self-center bg-slate-400/20 lg:my-0 lg:h-16 lg:w-px" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-white/5 md:min-w-[240px]" />
        </div>
      </div>
    </div>
  );
}
