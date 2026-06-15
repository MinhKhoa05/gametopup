import { ImageBox } from '@/shared/components';
import type { Game } from '@/features/games/types';

type GameHeroProps = {
  game: Game;
};

export function GameHero({ game }: GameHeroProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,15,29,0.96),rgba(6,11,22,0.92))] px-5 py-4 shadow-[0_20px_56px_rgba(2,6,23,0.18)] sm:px-6 sm:py-5 lg:px-7 lg:py-5">
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[22px] border border-cyan-400/18 bg-white/[0.03] p-1.5 sm:h-[88px] sm:w-[88px]">
          <ImageBox src={game.imageUrl} alt={game.name} className="h-full w-full rounded-[16px] object-cover" />
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-400/16 bg-cyan-400/8 px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.3em] text-cyan-200/90">
              NẠP GAME
            </span>
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-slate-400">1 màn checkout</span>
          </div>

          <h1 className="break-words text-[clamp(2rem,4vw,3.2rem)] font-black leading-[0.94] tracking-tight text-white">{game.name}</h1>
          <p className="max-w-[60ch] text-sm leading-6 text-slate-300 sm:text-[0.96rem]">Chọn gói nạp phù hợp và tạo đơn hàng chỉ trong vài bước.</p>
        </div>
      </div>
    </section>
  );
}
