import { FormEvent, useEffect, useMemo, useState } from 'react';
import { filterByQuery } from '@/shared/lib/search';
import type { GamePackage } from '@/features/games/types';
import type { AdminGameSummary } from '@/features/admin/games/api';

const emptyPackageForm = {
  gameId: 0,
  importPrice: 0,
  isActive: true,
  name: '',
  originalPrice: 0,
  salePrice: 0,
  availableSlots: 0,
};

export function useAdminPackagesPageState({
  games,
  packages,
  onCreatePackage,
  onDeletePackage,
  onUpdatePackage,
}: {
  games: AdminGameSummary[];
  packages: GamePackage[];
  onCreatePackage: (payload: {
    gameId: number;
    imageFile: File | null;
    importPrice: number;
    isActive: boolean;
    name: string;
    originalPrice: number;
    salePrice: number;
    availableSlots: number;
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
      availableSlots: number;
    },
  ) => Promise<void>;
}) {
  const [editing, setEditing] = useState<GamePackage | null>(null);
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

  const scopedPackages = useMemo(() => {
    const selectedGamePackages = packages.filter((item) => item.gameId === selectedGameId);
    return filterByQuery(selectedGamePackages, query, (item) => item.name);
  }, [packages, query, selectedGameId]);

  function startEdit(item: GamePackage) {
    setEditing(item);
    setSelectedGameId(item.gameId);
    setForm({
      gameId: item.gameId,
      importPrice: item.importPrice,
      isActive: item.isActive,
      name: item.name,
      originalPrice: item.originalPrice,
      salePrice: item.salePrice,
      availableSlots: item.availableSlots,
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
          availableSlots: payload.availableSlots,
        })
      : onCreatePackage(payload));
    resetForm();
  }

  async function updatePackage(
    payload: {
      id: number;
      imageFile: File | null;
      importPrice: number;
      isActive: boolean;
      name: string;
      originalPrice: number;
      salePrice: number;
      availableSlots: number;
    },
  ) {
    await onUpdatePackage(payload);
  }

  async function remove(item: GamePackage) {
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
    updatePackage,
  };
}
