import type { GamePackage } from '@/features/games/contracts';
import { GamePackageCard } from './GamePackageCard';

type GamePackageGridProps = {
  isLoading: boolean;
  packages: GamePackage[];
  selectedPackageId: number | null;
  onSelectPackage: (packageId: number) => void;
};

export function GamePackageGrid({ isLoading, packages, selectedPackageId, onSelectPackage }: GamePackageGridProps) {
  return (
    <section id="packages" className="grid gap-4 scroll-mt-24">
      <div className="space-y-1">
        <h2 className="text-[clamp(1.2rem,1.8vw,1.6rem)] font-black tracking-tight text-white">Chọn gói nạp</h2>
      </div>

      {isLoading && packages.length === 0 ? (
        <GamePackageGridSkeleton />
      ) : packages.length === 0 ? (
        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] px-5 py-8 text-sm text-slate-400">Chưa có gói nạp.</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,214px))] justify-start gap-3 sm:gap-4">
          {packages.map((pkg) => (
            <GamePackageCard key={pkg.id} gamePackage={pkg} isSelected={selectedPackageId === pkg.id} onSelect={onSelectPackage} />
          ))}
        </div>
      )}
    </section>
  );
}

function GamePackageGridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,214px))] justify-start gap-3 sm:gap-4" aria-busy="true" aria-label="Đang tải gói nạp">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={`package-skeleton-${index}`} className="flex min-h-[250px] flex-col gap-3 rounded-[20px] border border-white/[0.06] bg-white/[0.025] p-2" aria-hidden="true">
          <div className="aspect-square rounded-[16px] bg-white/[0.05]" />
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/8" />
          <div className="h-8 w-28 rounded-[12px] bg-white/8" />
          <div className="h-3 w-20 rounded-full bg-white/6" />
        </div>
      ))}
    </div>
  );
}
