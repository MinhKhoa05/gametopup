import { Plus, Save } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import type { AdminGame } from '@/features/games/types';
import { Dialog, Field, FormActions, ImagePicker, ToggleField } from '@/shared/components';

type GameFormDialogProps = {
  busy: boolean;
  game: AdminGame | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    id?: number;
    imageFile: File | null;
    isActive: boolean;
    name: string;
  }) => Promise<AdminGame>;
};

export function GameFormDialog({ busy, game, isOpen, onClose, onSubmit }: GameFormDialogProps) {
  const isEditing = Boolean(game);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(game?.name ?? '');
    setIsActive(game?.isActive ?? true);
    setImageFile(null);
  }, [game, isOpen]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!isEditing && !imageFile) {
      return;
    }

    await onSubmit(
      isEditing
        ? {
            id: game?.id,
            imageFile,
            isActive,
            name: name.trim(),
          }
        : {
            imageFile,
            isActive,
            name: name.trim(),
          },
    );

    onClose();
  }

  return (
    <Dialog
      bodyClassName="p-4 sm:p-6"
      description={isEditing ? `Game #${game?.id} · ${game?.isActive ? 'Đang bán' : 'Đang ẩn'}` : 'Điền thông tin cho game mới.'}
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Sửa game' : 'Tạo game mới'}
      maxWidthClassName="max-w-3xl"
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-3">
          <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
            <ImagePicker
              className="min-h-44 w-full overflow-hidden"
              onChange={setImageFile}
              src={game?.imageUrl}
              alt={game?.name || name || 'Xem trước ảnh game'}
            />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
            <Field
              label="Tên game"
              onChange={(event) => setName(event.target.value)}
              placeholder="Nhập tên game"
              required
              value={name}
            />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
            <ToggleField checked={isActive} label="Đang bán" onChange={setIsActive} />
          </div>
        </div>

        <FormActions
          disabled={busy || (!isEditing && !imageFile)}
          onCancel={onClose}
          submitIcon={isEditing ? <Save size={17} /> : <Plus size={17} />}
          submitLabel={isEditing ? 'Lưu game' : 'Tạo game'}
        />
      </form>
    </Dialog>
  );
}
