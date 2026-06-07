import { FormEvent, useMemo, useState } from 'react';
import type { Game } from '../../types';
import { filterByQuery } from '../../lib/search';
import { useGamesQuery } from '../../services/games';
import { useAdminGameMutations } from '../../services/admin/admin-games.service';

export function useAdminGamesSection() {
  const gamesQuery = useGamesQuery();
  const gameMutations = useAdminGameMutations();

  const games = gamesQuery.data ?? [];
  const loading = gamesQuery.isPending && !gamesQuery.data;
  const busy = [gameMutations.create.isPending, gameMutations.update.isPending, gameMutations.remove.isPending].some(Boolean);

  return {
    busy,
    createGame: async (payload: Parameters<typeof gameMutations.create.mutateAsync>[0]) => {
      await gameMutations.create.mutateAsync(payload);
    },
    games,
    loading,
    removeGame: async (id: number) => {
      await gameMutations.remove.mutateAsync({ id });
    },
    updateGame: async (payload: { id: number; imageFile: File | null; isActive: boolean; name: string }) => {
      await gameMutations.update.mutateAsync({
        id: payload.id,
        payload: {
          name: payload.name,
          imageFile: payload.imageFile,
          isActive: payload.isActive,
        },
      });
    },
  };
}

const emptyGameForm = {
  isActive: true,
  name: '',
};

export function useAdminGamesPanel({
  games,
  onCreateGame,
  onDeleteGame,
  onUpdateGame,
}: {
  games: Game[];
  onCreateGame: (payload: { imageFile: File | null; isActive: boolean; name: string }) => Promise<void>;
  onDeleteGame: (id: number) => Promise<void>;
  onUpdateGame: (payload: { id: number; imageFile: File | null; isActive: boolean; name: string }) => Promise<void>;
}) {
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState(emptyGameForm);
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const filteredGames = useMemo(() => filterByQuery(games, query, (game) => game.name), [games, query]);

  function startEdit(game: Game) {
    setEditing(game);
    setForm({ isActive: game.isActive, name: game.name });
    setImageFile(null);
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyGameForm);
    setImageFile(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!editing && !imageFile) {
      return;
    }

    const payload = { ...form, imageFile, name: form.name.trim() };
    await (editing ? onUpdateGame({ id: editing.id, ...payload }) : onCreateGame(payload));
    resetForm();
  }

  async function remove(game: Game) {
    if (!window.confirm(`Xóa game "${game.name}"?`)) return;
    await onDeleteGame(game.id);
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
  };
}
