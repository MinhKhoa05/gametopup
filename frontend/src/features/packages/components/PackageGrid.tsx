import type { GamePackage } from '@/features/packages/types';
import { LoadingState } from '@/shared/components';
import { PackageCard } from './PackageCard';

type GamePackageGridProps = {
  isLoading: boolean;
  packages: GamePackage[];
  selectedPackageId: number | null;
  onSelectPackage: (packageId: number) => void;
};

export function PackageGrid({ isLoading, packages, selectedPackageId, onSelectPackage }: GamePackageGridProps) {
  return (
    <section id="packages" className="grid gap-4 scroll-mt-24">
      <div className="space-y-1">
        <h2 className="text-[clamp(1.2rem,1.8vw,1.6rem)] font-black tracking-tight text-white">Chọn gói nạp</h2>
      </div>

      {isLoading && packages.length === 0 ? (
        <LoadingState title="Dang tai goi nap..." />
      ) : packages.length === 0 ? (
        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] px-5 py-8 text-sm text-slate-400">Chưa có gói nạp.</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,214px))] justify-start gap-3 sm:gap-4">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              packageItem={pkg}
              selected={selectedPackageId === pkg.id}
              onClick={() => onSelectPackage(pkg.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
