import { classNames } from "@/shared/lib/classNames";
import brandLogoSrc from "@/assets/brand/logo.svg";

type BrandLogoProps = {
  className?: string;
  collapsed?: boolean;
  adminDot?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
};

export function BrandLogo({
  className,
  collapsed = false,
  adminDot = false,
  onClick,
  size = "md",
}: BrandLogoProps) {
  const imageSize =
    size === "lg" ? "h-12 w-12" : size === "sm" ? "h-9 w-9" : "h-10 w-10";

  const titleSize =
    size === "lg"
      ? "text-[1.45rem]"
      : size === "sm"
        ? "text-lg"
        : "text-[1.3rem]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "group inline-flex items-center gap-3 border-0 bg-transparent p-0 text-left transition-transform duration-200 hover:-translate-y-0.5",
        collapsed && "justify-center",
        className,
      )}
    >
      <span className="relative shrink-0">
        <img
          src={brandLogoSrc}
          alt="GameTopUp"
          className={classNames(
            "block object-contain transition-transform duration-200 group-hover:scale-[1.03]",
            imageSize,
          )}
        />

        {adminDot ? (
          <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border border-[var(--gt-bg-soft)] bg-cyan-400" />
        ) : null}
      </span>

      {!collapsed && (
        <span className="flex items-center">
          <span
            className={classNames(
              "font-black leading-none tracking-[-0.03em]",
              titleSize,
            )}
          >
            <span className="gt-text">Game</span>
            <span className="text-cyan-300">TopUp</span>
          </span>
        </span>
      )}
    </button>
  );
}
