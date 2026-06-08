import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { AdminGamePackage, Game } from '@/features/games/games.types';
import { filterByName } from '@/features/admin/components/admin.utils';
import { useAdminPackageMutations, useAdminPackagesQuery } from '@/features/admin/api/admin-packages.service';

export function useAdminPackagesSection() {
  const packagesQuery = useAdminPackagesQuery();
  const packageMutations = useAdminPackageMutations();

  const packages = packagesQuery.data ?? [];
  const loading = packagesQuery.isPending && !packagesQuery.data;
  const busy = [packageMutations.create.isPending, packageMutations.update.isPending, packageMutations.remove.isPending].some(Boolean);

  return {
    busy,
    createPackage: async (payload: Parameters<typeof packageMutations.create.mutateAsync>[0]) => {
      await packageMutations.create.mutateAsync(payload);
    },
    loading,
    packages,
    removePackage: async (id: number) => {
      await packageMutations.remove.mutateAsync({ id });
    },
    updatePackage: async (payload: {
      id: number;
      imageFile: File | null;
      importPrice: number;
      isActive: boolean;
      name: string;
      originalPrice: number;
      salePrice: number;
      stockQuantity: number;
    }) => {
      await packageMutations.update.mutateAsync({
        id: payload.id,
        payload: {
          imageFile: payload.imageFile,
          importPrice: payload.importPrice,
          isActive: payload.isActive,
          name: payload.name,
          originalPrice: payload.originalPrice,
          salePrice: payload.salePrice,
          stockQuantity: payload.stockQuantity,
        },
      });
    },
  };
}

const emptyPackageForm = {
  gameId: 0,
  importPrice: 0,
  isActive: true,
  name: '',
  originalPrice: 0,
  salePrice: 0,
  stockQuantity: 0,
};

export function useAdminPackagesPanel({
  games,
  packages,
  onCreatePackage,
  onDeletePackage,
  onUpdatePackage,
}: {
  games: Game[];
  packages: AdminGamePackage[];
  onCreatePackage: (payload: {
    gameId: number;
    imageFile: File | null;
    importPrice: number;
    isActive: boolean;
    name: string;
    originalPrice: number;
    salePrice: number;
    stockQuantity: number;
  }) => Promise<void>;
  onDeletePackage: (id: number) => Promise<void>;
  onUpdatePackage: (
    payload: {
      id: number;
      imageFile: File | null;
      importPrice: number;
      isActive: boolean;
      name: string;
      originalPrice: number;
      salePrice: number;
      stockQuantity: number;
    },
  ) => Promise<void>;
}) {
  const [editing, setEditing] = useState<AdminGamePackage | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyPackageForm);
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (games.length === 0) {
      setSelectedGameId(null);
      return;
    }

    setSelectedGameId((current) => (current && games.some((game) => game.id === current) ? current : games[0].id));
  }, [games]);

  useEffect(() => {
    if (editing) return;

    setForm((current) => ({
      ...current,
      gameId: selectedGameId ?? games[0]?.id ?? 0,
    }));
  }, [editing, games, selectedGameId]);

  const selectedGamePackages = useMemo(() => packages.filter((item) => item.gameId === selectedGameId), [packages, selectedGameId]);
  const scopedPackages = useMemo(() => filterByName(selectedGamePackages, query), [selectedGamePackages, query]);

  function startEdit(item: AdminGamePackage) {
    setEditing(item);
    setSelectedGameId(item.gameId);
    setForm({
      gameId: item.gameId,
      importPrice: item.importPrice,
      isActive: item.isActive,
      name: item.name,
      originalPrice: item.originalPrice,
      salePrice: item.salePrice,
      stockQuantity: item.stockQuantity,
    });
    setImageFile(null);
  }

  function resetForm() {
    setEditing(null);
    setForm({
      ...emptyPackageForm,
      gameId: selectedGameId ?? games[0]?.id ?? 0,
    });
    setImageFile(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!editing && !imageFile) {
      return;
    }

    const payload = {
      ...form,
      gameId: form.gameId || selectedGameId || games[0]?.id || 0,
      imageFile,
      name: form.name.trim(),
    };
    await (editing
      ? onUpdatePackage({
          id: editing.id,
          imageFile: payload.imageFile,
          importPrice: payload.importPrice,
          isActive: payload.isActive,
          name: payload.name,
          originalPrice: payload.originalPrice,
          salePrice: payload.salePrice,
          stockQuantity: payload.stockQuantity,
        })
      : onCreatePackage(payload));
    resetForm();
  }

  async function remove(item: AdminGamePackage) {
    if (!window.confirm(`Xóa gói "${item.name}"?`)) return;
    await onDeletePackage(item.id);
  }

  return {
    editing,
    imageFile,
    form,
    query,
    remove,
    resetForm,
    scopedPackages,
    selectedGameId,
    setForm,
    setImageFile,
    setQuery,
    setSelectedGameId,
    startEdit,
    submit,
  };
}
