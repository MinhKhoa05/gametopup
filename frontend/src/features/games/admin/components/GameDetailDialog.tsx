import { ArrowRight, CheckCircle2, EyeOff, PencilLine, X } from 'lucide-react';
import type { AdminGame } from '@/features/games/types';
import { Badge, Button, DetailRow, Dialog, ImageBox } from '@/shared/components';
import { formatDate } from '@/shared/lib/format';

type GameDetailDialogProps = {
  busy: boolean;
  game: AdminGame | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (game: AdminGame) => void;
  onToggleActive: (game: AdminGame) => Promise<void>;
  onViewPackages: () => void;
};

export function GameDetailDialog({
  busy,
  game,
  isOpen,
  onClose,
  onEdit,
  onToggleActive,
  onViewPackages,
}: GameDetailDialogProps) {
  if (!game) {
    return null;
  }

  return (
    <Dialog
      bodyClassName="p-4 sm:p-6"
      description={`Game #${game.id} · ${game.isActive ? 'Đang bán' : 'Đang ẩn'}`}
      headerActions={
        <Button
          variant="secondary"
          className="justify-center rounded-[16px] px-4"
          onClick={() => onEdit(game)}
        >
          <PencilLine size={16} />
          Sửa game
        </Button>
      }
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết game"
      maxWidthClassName="max-w-4xl"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[var(--gt-card)] shadow-[0_20px_60px_rgba(0,0,0,.18)]">
          <div className="grid gap-4 p-4 sm:p-5">
            <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.03]">
              <ImageBox src={game.imageUrl} alt={game.name} className="aspect-[16/11] w-full object-cover" />
            </div>

            <div className="grid gap-2">
              <h3 className="m-0 text-[1.2rem] font-black tracking-[-0.03em] gt-text">{game.name}</h3>
              <div className="flex flex-wrap gap-2">
                <Badge tone={game.isActive ? 'success' : 'neutral'} icon={game.isActive ? <CheckCircle2 size={14} /> : <X size={14} />}>
                  {game.isActive ? 'Bật' : 'Tắt'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="outline"
                className="justify-center rounded-[16px] px-4 border-amber-400/20 bg-amber-500/10 text-amber-200 hover:border-amber-300/30 hover:bg-amber-500/15 hover:text-amber-100"
                disabled={busy}
                onClick={() => void onToggleActive(game)}
              >
                <EyeOff size={16} />
                {game.isActive ? 'Ẩn game' : 'Hiện game'}
              </Button>
              <Button variant="primary" className="justify-center rounded-[16px] px-4" onClick={onViewPackages}>
                Xem gói của game này
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[var(--gt-card)] shadow-[0_20px_60px_rgba(0,0,0,.18)]">
          <div className="grid gap-0 px-4 py-4 sm:px-5 sm:py-5">
            <DetailRow label="Mã game">#{game.id}</DetailRow>
            <DetailRow label="Ngày tạo">{formatDate(game.createdAt)}</DetailRow>
            <DetailRow label="Cập nhật">{formatDate(game.updatedAt)}</DetailRow>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
