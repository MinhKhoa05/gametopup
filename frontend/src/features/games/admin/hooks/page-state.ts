import { FormEvent, useMemo, useState } from 'react';
import { filterByQuery } from '@/shared/lib/search';
import type { AdminGame } from '@/features/games/types';

export function useAdminGamesPageState({
  games,
  onCreateGame,
  onDeleteGame,
  onUpdateGame,
}: {
  games: AdminGame[];
  onCreateGame: (payload: { imageFile: File | null; isActive: boolean; name: string }) => Promise<AdminGame>;
  onDeleteGame: (id: number) => Promise<void>;
  onUpdateGame: (payload: { id: number; imageFile: File | null; isActive: boolean; name: string }) => Promise<AdminGame>;
}) {
  const [editing, setEditing] = useState<AdminGame | null>(null);
  const [form, setForm] = useState({
    isActive: true,
    name: '',
  });
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const filteredGames = useMemo(() => filterByQuery(games, query, (game) => game.name), [games, query]);

  function startEdit(game: AdminGame) {
    setEditing(game);
    setForm({ isActive: game.isActive, name: game.name });
    setImageFile(null);
  }

  function resetForm() {
    setEditing(null);
    setForm({
      isActive: true,
      name: '',
    });
    setImageFile(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!editing && !imageFile) {
      return null;
    }

    const payload = { ...form, imageFile, name: form.name.trim() };
    const savedGame = await (editing ? onUpdateGame({ id: editing.id, ...payload }) : onCreateGame(payload));
    resetForm();
    return savedGame;
  }

  async function remove(game: AdminGame) {
    if (!window.confirm(`Xóa game "${game.name}"?`)) return;
    await onDeleteGame(game.id);
  }

  async function updateGame(payload: { id: number; imageFile: File | null; isActive: boolean; name: string }) {
    return onUpdateGame(payload);
  }

  return {
    editing,
    filteredGames,
    form,
    imageFile,
    query,
    remove,
    resetForm,
    setForm,
    setImageFile,
    setQuery,
    startEdit,
    submit,
    updateGame,
  };
}
