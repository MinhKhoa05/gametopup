import { CheckCircle2 } from "lucide-react";

import { ImageBox } from "@/shared/components";
import { classNames } from "@/shared/lib/classNames";
import { formatCurrency } from "@/shared/lib/format";

import type { GamePackage } from "@/features/games/contracts";

type GamePackageCardProps = {
  gamePackage: GamePackage;
  isSelected: boolean;
  onSelect: (packageId: number) => void;
};

export function GamePackageCard({
  gamePackage,
  isSelected,
  onSelect,
}: GamePackageCardProps) {
  const hasDiscount = gamePackage.originalPrice > gamePackage.salePrice;

  const discountPercent = hasDiscount
    ? Math.max(
        1,
        Math.round(
          (1 - gamePackage.salePrice / gamePackage.originalPrice) * 100,
        ),
      )
    : 0;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(gamePackage.id)}
      className={classNames(
        "group relative mx-auto flex aspect-[0.82/1] w-full max-w-[214px] min-w-0 flex-col overflow-hidden rounded-2xl border p-1.5 text-center transition-all duration-300",
        "border-white/[0.06] bg-[var(--gt-card)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gt-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gt-bg)]",
        "hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_10px_24px_rgba(0,0,0,.25)]",
        !isSelected && "opacity-[0.96] hover:opacity-100",
        isSelected &&
          "border-[var(--gt-primary-border)] bg-[rgba(34,211,238,.04)] shadow-[0_0_0_1px_rgba(34,211,238,.18),0_14px_30px_rgba(0,0,0,.28)]",
      )}
    >
      {isSelected && (
        <>
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(34,211,238,.12),transparent_72%)]" />

          <div className="absolute right-3 top-3 z-20">
            <CheckCircle2
              size={20}
              className="fill-[var(--gt-primary)] text-[var(--gt-primary)]"
            />
          </div>
        </>
      )}

      {hasDiscount && (
        <div className="absolute left-3 top-3 z-20">
          <div className="rounded-md bg-[var(--gt-primary)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.03em] text-[var(--gt-primary-text)]">
            -{discountPercent}%
          </div>
        </div>
      )}

      <div className="relative flex flex-[1.18] items-center justify-center">
        <div className="relative h-[118px] w-full overflow-hidden rounded-xl bg-[var(--gt-bg-soft)]">
          <ImageBox
            src={gamePackage.imageUrl}
            alt={gamePackage.name}
            className={classNames(
              "h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.03]",
              isSelected && "brightness-110 saturate-110",
            )}
          />
        </div>
      </div>

      <div className="relative grid flex-[0.72] content-start gap-0.5 px-0.5 pb-0.5 pt-1">
        <h3
          title={gamePackage.name}
          className={classNames(
            "min-h-[2.55rem] overflow-hidden px-0.5 text-[15px] font-semibold leading-5 transition-colors [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]",
            isSelected ? "gt-text" : "gt-text-soft",
          )}
        >
          {gamePackage.name}
        </h3>

        <div className="grid gap-0.5">
          <div
            className={classNames(
              "text-xl font-black leading-none transition-all duration-300",
              isSelected
                ? "scale-[1.04] text-[var(--gt-primary-hover)]"
                : "text-[var(--gt-primary)]",
            )}
          >
            {formatCurrency(gamePackage.salePrice)}
          </div>

          {hasDiscount && (
            <div className="text-xs font-medium leading-none gt-text-disabled line-through">
              {formatCurrency(gamePackage.originalPrice)}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
