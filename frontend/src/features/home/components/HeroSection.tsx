import { ArrowRight } from "lucide-react";
import { SITE_IMAGES } from "@/app/config/site";
import { Button } from "@/shared/components";

type HeroSectionProps = {
  onExploreGames: () => void;
};

export function HeroSection({ onExploreGames }: HeroSectionProps) {
  return (
    <section className="gt-panel overflow-hidden rounded-[28px]">
      <div className="grid items-center gap-10 p-8 lg:grid-cols-[1fr_0.95fr] lg:px-10 lg:py-12">
        <div className="grid gap-5">
          <div className="grid gap-4">
            <strong className="text-[1.8rem] font-bold tracking-[-0.02em]">
              <span className="gt-text">Game</span>
              <span className="text-cyan-300">TopUp</span>
            </strong>

            <h1 className="max-w-xl text-4xl font-bold leading-tight">
              Nạp game nhanh chóng,
              đơn giản và minh bạch.
            </h1>

            <p className="max-w-lg text-base leading-7 gt-text-soft">
              Khám phá các tựa game phổ biến, lựa chọn gói nạp phù hợp và theo
              dõi trạng thái đơn hàng trong một giao diện đơn giản, dễ sử dụng.
            </p>
          </div>

          <Button
            variant="primary"
            className="w-fit rounded-[14px] px-5"
            onClick={onExploreGames}
            trailingIcon = {<ArrowRight size={16} />}
          >
            Khám phá game
          </Button>
        </div>

        <div className="flex justify-center lg:justify-end">
          <img
            src={SITE_IMAGES.home.heroIllustration}
            alt="GameTopUp"
            className="w-full max-w-[600px] object-contain"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}