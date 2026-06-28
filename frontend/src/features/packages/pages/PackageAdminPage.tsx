import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EyeOff, PencilLine, Plus, Save } from 'lucide-react';

import { routes } from '@/app/router/routes';
import { useAdminGamesQuery, useUpdateGameMutation } from '@/features/games/server';
import { GameFormDialog } from '@/features/games/components/GameFormDialog';
import { GamePackageCard } from '@/features/packages/components/PackageCard';
import {
  useAdminPackagesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
} from '@/features/packages/server';
import type { AdminGamePackage } from '@/features/packages/types';
import {
  Badge,
  Button,
  Dialog,
  DetailRow,
  EmptyState,
  Field,
  FilterChipGroup,
  FormActions,
  ImageBox,
  ImagePicker,
  PageHero,
  SearchBar,
  ToggleField,
} from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import { formatCurrency, formatDate } from '@/shared/lib/format';

type StatusFilter = 'all' | 'active' | 'inactive';
type ActiveDialog = 'game' | 'package-detail' | 'package-form' | null;

type PackageFormState = {
  availableSlots: number;
  importPrice: number;
  isActive: boolean;
  name: string;
  originalPrice: number;
  salePrice: number;
};

const emptyPackageForm: PackageFormState = {
  availableSlots: 0,
  importPrice: 0,
  isActive: true,
  name: '',
  originalPrice: 0,
  salePrice: 0,
};

export function GamePackageAdminPage() {
  const navigate = useNavigate();
  const { gameId: gameIdParam } = useParams<{ gameId?: string }>();
  const gameId = Number(gameIdParam);
  const gamesQuery = useAdminGamesQuery();
  const updateGameMutation = useUpdateGameMutation();
  const packagesQuery = useAdminPackagesQuery(gameId);
  const createPackageMutation = useCreatePackageMutation();
  const updatePackageMutation = useUpdatePackageMutation();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [editingPackage, setEditingPackage] = useState<AdminGamePackage | null>(null);
  const [packageForm, setPackageForm] = useState<PackageFormState>(emptyPackageForm);
  const [packageImageFile, setPackageImageFile] = useState<File | null>(null);

  const game = Number.isFinite(gameId)
    ? gamesQuery.data?.find((item) => item.id === gameId) ?? null
    : null;

  const packages = packagesQuery.data ?? [];

  const gamePackages = useMemo(
    () => packages.filter((item) => item.gameId === gameId),
    [gameId, packages],
  );

  const visiblePackages = useMemo(() => {
    return gamePackages.filter((item) => {
      if (statusFilter === 'active') return item.isActive;
      if (statusFilter === 'inactive') return !item.isActive;
      return true;
    }).filter((item) => {
      if (!query.trim()) return true;
      return item.name.toLowerCase().includes(query.trim().toLowerCase());
    });
  }, [gamePackages, query, statusFilter]);

  const selectedPackage = useMemo(() => {
    if (!selectedPackageId) {
      return null;
    }
    return gamePackages.find((item) => item.id === selectedPackageId) ?? null;
  }, [gamePackages, selectedPackageId]);

  useEffect(() => {
    setQuery('');
    setStatusFilter('all');
    setSelectedPackageId(null);
    setActiveDialog(null);
    setEditingPackage(null);
    setPackageImageFile(null);
    setPackageForm(emptyPackageForm);
  }, [gameId]);

  useEffect(() => {
    if (visiblePackages.length === 0) {
      setSelectedPackageId(null);
      return;
    }

    if (!selectedPackageId || !visiblePackages.some((item) => item.id === selectedPackageId)) {
      setSelectedPackageId(visiblePackages[0].id);
    }
  }, [selectedPackageId, visiblePackages]);

  if (gamesQuery.isPending && !game) {
    return (
      <div className="grid gap-5">
        <PackagesAdminSkeleton />
      </div>
    );
  }

  if (!game) {
    return (
      <EmptyState
        className="mx-auto max-w-2xl"
        title="Không tìm thấy game"
        description="Hãy quay lại danh sách game và chọn lại mục cần quản lý."
      >
        <div className="mt-4 flex justify-center">
          <Button variant="primary" onClick={() => navigate(routes.admin('games'))}>
            Quay lại Games
          </Button>
        </div>
      </EmptyState>
    );
  }

  const loading = (gamesQuery.isPending && !gamesQuery.data) || (packagesQuery.isPending && !packagesQuery.data);
  const busy =
    updateGameMutation.isPending ||
    createPackageMutation.isPending ||
    updatePackageMutation.isPending;
  const isGameActive = game.isActive;
  const totalPackages = gamePackages.length;

  const openEditGameDialog = () => {
    setActiveDialog('game');
  };

  const handleSubmitGame = async (payload: {
    imageFile: File | null;
    isActive: boolean;
    name: string;
  }) => {
    if (!game) {
      throw new Error('Missing game context');
    }

    return updateGameMutation.mutateAsync({
      id: game.id,
      input: {
        imageFile: payload.imageFile,
        isActive: payload.isActive,
        name: payload.name,
      },
    });
  };

  const handleToggleGame = async () => {
    await updateGameMutation.mutateAsync({
      id: game.id,
      input: {
        imageFile: null,
        isActive: !game.isActive,
        name: game.name,
      },
    });
  };

  const openCreatePackageDialog = () => {
    setEditingPackage(null);
    setPackageForm(emptyPackageForm);
    setPackageImageFile(null);
    setActiveDialog('package-form');
  };

  const openEditPackageDialog = (item: AdminGamePackage) => {
    setEditingPackage(item);
    setPackageForm({
      availableSlots: item.availableSlots,
      importPrice: item.importPrice,
      isActive: item.isActive,
      name: item.name,
      originalPrice: item.originalPrice,
      salePrice: item.salePrice,
    });
    setPackageImageFile(null);
    setActiveDialog('package-form');
  };

  const handleSubmitPackage = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    if (editingPackage) {
      await updatePackageMutation.mutateAsync({
        id: editingPackage.id,
        input: {
          imageFile: packageImageFile,
          importPrice: packageForm.importPrice,
          isActive: packageForm.isActive,
          name: packageForm.name.trim(),
          originalPrice: packageForm.originalPrice,
          salePrice: packageForm.salePrice,
          availableSlots: packageForm.availableSlots,
        },
      });
    } else {
      await createPackageMutation.mutateAsync({
        gameId: game.id,
        input: {
          imageFile: packageImageFile,
          importPrice: packageForm.importPrice,
          isActive: packageForm.isActive,
          name: packageForm.name.trim(),
          originalPrice: packageForm.originalPrice,
          salePrice: packageForm.salePrice,
          availableSlots: packageForm.availableSlots,
        },
      });
    }
  };

  const handleTogglePackage = async (item: AdminGamePackage) => {
    await updatePackageMutation.mutateAsync({
      id: item.id,
      input: {
        imageFile: null,
        importPrice: item.importPrice,
        isActive: !item.isActive,
        name: item.name,
        originalPrice: item.originalPrice,
        salePrice: item.salePrice,
        availableSlots: item.availableSlots,
      },
    });
  };

  const heroDescription = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.96rem] leading-7 gt-text-muted">
      <span className="inline-flex items-center gap-2">
        <span className={classNames('size-2.5 rounded-full', isGameActive ? 'bg-emerald-400' : 'bg-rose-400')} />
        {isGameActive ? 'Đang bán' : 'Đang ẩn'}
      </span>
      <span>•</span>
      <span>{totalPackages} gói nạp</span>
      <span>•</span>
      <span>Tạo {formatDate(game.createdAt)}</span>
    </div>
  );

  return (
    <div className="grid gap-5">
      <PageHero
        onClick={() => navigate(routes.admin('games'))}
        visual={
          <div className="h-[72px] w-[72px] overflow-hidden rounded-[22px] border border-[color:var(--gt-border)] bg-[var(--gt-panel-soft)] shadow-[0_10px_24px_rgba(2,6,23,0.18)] sm:h-[88px] sm:w-[88px]">
            <ImageBox src={game.imageUrl} alt={game.name} className="h-full w-full object-cover" />
          </div>
        }
        title={game.name}
        description={heroDescription}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              className="justify-center rounded-[16px] px-4"
              onClick={openCreatePackageDialog}
              leadingIcon={<Plus size={16} />}
            >
              Thêm gói nạp
            </Button>
            <Button
              variant="secondary"
              className="justify-center rounded-[16px] px-4"
              onClick={openEditGameDialog}
              leadingIcon={<PencilLine size={16} />}
            >
              Sửa game
            </Button>
            <Button
              variant="outline"
              className="justify-center rounded-[16px] px-4 border-amber-400/20 bg-amber-500/10 text-amber-200 hover:border-amber-300/30 hover:bg-amber-500/15 hover:text-amber-100"
              disabled={busy}
              onClick={() => void handleToggleGame()}
              leadingIcon={<EyeOff size={16} />}
            >
              {isGameActive ? 'Ẩn game' : 'Hiện game'}
            </Button>
          </div>
        }
      />

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Tìm gói nạp..."
        dense
      />

      <FilterChipGroup
        ariaLabel="Lọc gói nạp"
        items={[
          { label: 'Tất cả', value: 'all' },
          { label: 'Đang bán', value: 'active' },
          { label: 'Đang ẩn', value: 'inactive' },
        ]}
        onChange={(value) => setStatusFilter(value as StatusFilter)}
        value={statusFilter}
      />

      {loading && visiblePackages.length === 0 ? (
        <PackagesGridSkeleton />
      ) : visiblePackages.length === 0 ? (
        <EmptyState
          title="Không tìm thấy gói"
          description="Thử đổi từ khóa hoặc bộ lọc trạng thái để xem các gói khác."
        >
          {(query.trim() || statusFilter !== 'all') && (
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="primary" onClick={() => setQuery('')}>
                Xóa từ khóa
              </Button>
              <Button variant="secondary" onClick={() => setStatusFilter('all')}>
                Xóa lọc
              </Button>
            </div>
          )}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,214px))] justify-start gap-3 sm:gap-4">
          {visiblePackages.map((item) => (
            <GamePackageCard
              key={item.id}
              gamePackage={item}
              overlay={
                <span
                  title={item.isActive ? 'Đang bán' : 'Đang ẩn'}
                  className={classNames(
                    'block size-4 rounded-full border border-[var(--gt-bg)] shadow-[0_0_0_4px_rgba(5,10,18,.62)]',
                    item.isActive ? 'bg-emerald-400' : 'bg-rose-400',
                  )}
                />
              }
              onClick={() => {
                setSelectedPackageId(item.id);
                setEditingPackage(item);
                setActiveDialog('package-detail');
              }}
            />
          ))}
        </div>
      )}

      <GamePackageDetailDialog
        busy={busy}
        gameName={game.name}
        item={selectedPackage}
        isOpen={activeDialog === 'package-detail' && Boolean(selectedPackage)}
        onClose={() => setActiveDialog(null)}
        onEdit={(item) => openEditPackageDialog(item)}
        onToggleActive={handleTogglePackage}
      />

      <GamePackageFormDialog
        busy={busy}
        gameName={game.name}
        item={editingPackage}
        form={packageForm}
        imageFile={packageImageFile}
        isOpen={activeDialog === 'package-form'}
        onClose={() => setActiveDialog(null)}
        onImageFileChange={setPackageImageFile}
        onSubmit={handleSubmitPackage}
        setForm={setPackageForm}
      />

      <GameFormDialog
        busy={busy}
        game={game}
        isOpen={activeDialog === 'game'}
        onClose={() => setActiveDialog(null)}
        onSubmit={handleSubmitGame}
      />
    </div>
  );
}

function GamePackageDetailDialog({
  busy,
  gameName,
  item,
  isOpen,
  onClose,
  onEdit,
  onToggleActive,
}: {
  busy: boolean;
  gameName: string;
  item: AdminGamePackage | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: AdminGamePackage) => void;
  onToggleActive: (item: AdminGamePackage) => Promise<void>;
}) {
  if (!item) {
    return null;
  }

  const hasDiscount = item.originalPrice > item.salePrice;
  const discountPercent = hasDiscount
    ? Math.max(1, Math.round((1 - item.salePrice / item.originalPrice) * 100))
    : 0;

  return (
    <Dialog
      bodyClassName="p-4 sm:p-6"
      description={`Gói #${item.id} · ${item.isActive ? 'Đang bán' : 'Đang ẩn'}`}
      headerActions={
        <Button variant="secondary" className="justify-center rounded-[16px] px-4" onClick={() => onEdit(item)}>
          <PencilLine size={16} />
          Sửa
        </Button>
      }
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết gói"
      maxWidthClassName="max-w-4xl"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[var(--gt-card)] shadow-[0_20px_60px_rgba(0,0,0,.18)]">
          <div className="grid gap-4 p-4 sm:p-5">
            <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.03]">
              <ImageBox src={item.imageUrl} alt={item.name} className="aspect-[16/11] w-full object-cover" />
            </div>

            <div className="grid gap-2">
              <h3 className="m-0 text-[1.2rem] font-black tracking-[-0.03em] gt-text">{item.name}</h3>
              <div className="flex flex-wrap gap-2">
                <Badge tone={item.isActive ? 'success' : 'neutral'}>{item.isActive ? 'Đang bán' : 'Đang ẩn'}</Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="outline"
                className="justify-center rounded-[16px] px-4 border-amber-400/20 bg-amber-500/10 text-amber-200 hover:border-amber-300/30 hover:bg-amber-500/15 hover:text-amber-100"
                disabled={busy}
                onClick={() => void onToggleActive(item)}
              >
                <EyeOff size={16} />
                {item.isActive ? 'Ẩn gói' : 'Hiện gói'}
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[var(--gt-card)] shadow-[0_20px_60px_rgba(0,0,0,.18)]">
          <div className="grid gap-0 px-4 py-4 sm:px-5 sm:py-5">
            <DetailRow label="Game">{gameName}</DetailRow>
            <DetailRow label="Mã gói">#{item.id}</DetailRow>
            <DetailRow label="Giá bán">{formatCurrency(item.salePrice)}</DetailRow>
            <DetailRow label="Giá gốc">{formatCurrency(item.originalPrice)}</DetailRow>
            <DetailRow label="Giá nhập">{formatCurrency(item.importPrice)}</DetailRow>
            <DetailRow label="Tồn kho">{item.availableSlots}</DetailRow>
            <DetailRow label="Tiết kiệm">
              {hasDiscount
                ? `${formatCurrency(Math.max(0, item.originalPrice - item.salePrice))} (${discountPercent}%)`
                : '0đ'}
            </DetailRow>
            <DetailRow label="Ngày tạo">{formatDate(item.createdAt)}</DetailRow>
            <DetailRow label="Cập nhật">{formatDate(item.updatedAt)}</DetailRow>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function GamePackageFormDialog({
  busy,
  gameName,
  item,
  form,
  imageFile,
  isOpen,
  onClose,
  onImageFileChange,
  onSubmit,
  setForm,
}: {
  busy: boolean;
  gameName: string;
  item: AdminGamePackage | null;
  form: PackageFormState;
  imageFile: File | null;
  isOpen: boolean;
  onClose: () => void;
  onImageFileChange: Dispatch<SetStateAction<File | null>>;
  onSubmit: (event: FormEvent) => Promise<void>;
  setForm: Dispatch<SetStateAction<PackageFormState>>;
}) {
  const isEditing = Boolean(item);

  async function handleSubmit(event: FormEvent) {
    await onSubmit(event);
    onClose();
  }

  return (
    <Dialog
      bodyClassName="p-4 sm:p-6"
      description={isEditing ? `Chỉnh sửa gói #${item?.id} · ${gameName}` : `Tạo gói mới cho ${gameName}.`}
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Sửa gói nạp' : 'Thêm gói nạp'}
      maxWidthClassName="max-w-3xl"
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-3">
          <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
            <ImagePicker
              className="min-h-44 w-full overflow-hidden"
              onChange={onImageFileChange}
              src={item?.imageUrl}
              alt={item?.name || form.name || 'Xem trước ảnh gói'}
            />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
            <Field
              label="Tên gói"
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Nhập tên gói"
              required
              value={form.name}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Giá gốc"
            min={0}
            onChange={(event) => setForm({ ...form, originalPrice: Number(event.target.value) })}
            placeholder="100000"
            required
            type="number"
            value={String(form.originalPrice)}
          />
          <Field
            label="Giá bán"
            min={0}
            onChange={(event) => setForm({ ...form, salePrice: Number(event.target.value) })}
            placeholder="90000"
            required
            type="number"
            value={String(form.salePrice)}
          />
          <Field
            label="Giá nhập"
            min={0}
            onChange={(event) => setForm({ ...form, importPrice: Number(event.target.value) })}
            placeholder="0"
            required
            type="number"
            value={String(form.importPrice)}
          />
          <Field
            label="Tồn kho"
            min={0}
            onChange={(event) => setForm({ ...form, availableSlots: Number(event.target.value) })}
            placeholder="50"
            required
            type="number"
            value={String(form.availableSlots)}
          />
        </div>

        <div className="grid gap-3">
          <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
            <ToggleField
              checked={form.isActive}
              label="Đang bán"
              onChange={(isActive) => setForm({ ...form, isActive })}
            />
          </div>
        </div>

        <FormActions
          disabled={busy || (!isEditing && !imageFile)}
          onCancel={onClose}
          submitIcon={isEditing ? <Save size={17} /> : <Plus size={17} />}
          submitLabel={isEditing ? 'Lưu gói' : 'Tạo gói'}
        />
      </form>
    </Dialog>
  );
}

function PackagesGridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,214px))] justify-start gap-3 sm:gap-4" aria-busy="true" aria-label="Đang tải gói nạp">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`package-skeleton-${index}`}
          className="flex aspect-[0.82/1] w-full max-w-[214px] flex-col gap-3 rounded-[20px] border border-white/[0.06] bg-white/[0.025] p-2"
          aria-hidden="true"
        >
          <div className="aspect-square rounded-[16px] bg-white/[0.05]" />
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/8" />
          <div className="h-8 w-28 rounded-[12px] bg-white/8" />
          <div className="h-3 w-20 rounded-full bg-white/6" />
        </div>
      ))}
    </div>
  );
}

function PackagesAdminSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="h-[220px] rounded-[24px] border border-white/[0.08] bg-white/[0.03] animate-pulse" />
      <div className="h-[3.25rem] rounded-[22px] border border-white/[0.08] bg-white/[0.03] animate-pulse" />
      <div className="flex flex-wrap gap-2">
        <div className="h-10 w-24 rounded-full bg-white/[0.05] animate-pulse" />
        <div className="h-10 w-24 rounded-full bg-white/[0.05] animate-pulse" />
        <div className="h-10 w-24 rounded-full bg-white/[0.05] animate-pulse" />
      </div>
      <PackagesGridSkeleton />
    </div>
  );
}
