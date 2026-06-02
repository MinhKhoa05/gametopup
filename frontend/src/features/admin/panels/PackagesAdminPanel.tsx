import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { AsyncActionExecutor } from '../../../hooks/useAsyncAction';
import { getApiMessage } from '../../../lib/api';
import { formatCurrency } from '../../../lib/format';
import { getPackagesByGame } from '../../games/services/gameService';
import type { Game, GamePackage } from '../../../types';
import { createGamePackage, deleteGamePackage, updateGamePackage } from '../services/adminService';
import { AdminSkeleton, EmptyLine, NumberField, PanelTitle, SearchBox, StatusPill, filterByName, gameName } from '../components/AdminShared';
import { Field } from '../../../components/common/Field';
import { classNames, pickImage } from '../../../lib/ui';

const emptyPackageForm = {
  gameId: 0,
  imageUrl: '',
  importPrice: 0,
  isActive: true,
  name: '',
  originalPrice: 0,
  salePrice: 0,
  stockQuantity: 0,
};

export function PackagesAdminPanel({
  busy,
  execute,
  games,
  loading,
  setError,
}: {
  busy: boolean;
  execute: AsyncActionExecutor;
  games: Game[];
  loading: boolean;
  setError: (message: string | null) => void;
}) {
  const [editing, setEditing] = useState<GamePackage | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [packages, setPackages] = useState<GamePackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [form, setForm] = useState(emptyPackageForm);
  const [query, setQuery] = useState('');

  async function refreshPackages(gameId: number) {
    setPackagesLoading(true);
    setError(null);

    try {
      const data = await getPackagesByGame(gameId);
      setPackages(data);
    } catch (err) {
      setError(getApiMessage(err));
    } finally {
      setPackagesLoading(false);
    }
  }

  useEffect(() => {
    if (games.length === 0) {
      setSelectedGameId(null);
      setPackages([]);
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

  useEffect(() => {
    let active = true;

    async function loadPackages() {
      if (!selectedGameId) {
        setPackages([]);
        return;
      }

      setPackagesLoading(true);
      setError(null);

      try {
        const data = await getPackagesByGame(selectedGameId);
        if (active) {
          setPackages(data);
        }
      } catch (err) {
        if (active) {
          setError(getApiMessage(err));
        }
      } finally {
        if (active) {
          setPackagesLoading(false);
        }
      }
    }

    loadPackages();

    return () => {
      active = false;
    };
  }, [selectedGameId, setError]);

  const scopedPackages = useMemo(() => filterByName(packages, query), [packages, query]);
  const profit = (item: GamePackage) => item.salePrice - item.importPrice;
  const selectedGame = selectedGameId ? games.find((game) => game.id === selectedGameId) ?? null : null;
  const previewSrc = form.imageUrl.trim() || (editing ? pickImage(editing) : selectedGame ? pickImage(selectedGame) : '');

  function startEdit(item: GamePackage) {
    setEditing(item);
    setSelectedGameId(item.gameId);
    setForm({
      gameId: item.gameId,
      imageUrl: item.imageUrl ?? '',
      importPrice: item.importPrice,
      isActive: item.isActive,
      name: item.name,
      originalPrice: item.originalPrice,
      salePrice: item.salePrice,
      stockQuantity: item.stockQuantity,
    });
  }

  function resetForm() {
    setEditing(null);
    setForm({
      ...emptyPackageForm,
      gameId: selectedGameId ?? games[0]?.id ?? 0,
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      ...form,
      gameId: form.gameId || selectedGameId || games[0]?.id || 0,
      imageUrl: form.imageUrl.trim(),
      name: form.name.trim(),
    };

    await execute(
      () =>
        editing
          ? updateGamePackage(editing.id, {
              imageUrl: payload.imageUrl,
              importPrice: payload.importPrice,
              isActive: payload.isActive,
              name: payload.name,
              originalPrice: payload.originalPrice,
              salePrice: payload.salePrice,
              stockQuantity: payload.stockQuantity,
            })
          : createGamePackage(payload),
      {
        successMessage: editing ? 'Đã cập nhật gói nạp.' : 'Đã tạo gói nạp mới.',
        onSuccess: async () => {
          resetForm();
          if (selectedGameId) {
            await refreshPackages(selectedGameId);
          }
        },
      },
    );
  }

  async function remove(item: GamePackage) {
    if (!window.confirm(`Xóa gói "${item.name}"?`)) return;

    await execute(() => deleteGamePackage(item.id), {
      successMessage: 'Đã xóa gói nạp.',
      onSuccess: async () => {
        if (selectedGameId) {
          await refreshPackages(selectedGameId);
        }
      },
    });
  }

  return (
    <div className="admin-editor-layout">
      <div className="gametopup-surface grid gap-[18px]">
        <PanelTitle title="Chọn game" />
        <div className="admin-game-tabs" role="tablist" aria-label="Chọn game để quản lý gói nạp">
          {games.map((game) => (
            <button
              key={game.id}
              type="button"
              className={classNames('admin-game-tab', selectedGameId === game.id && 'active')}
              disabled={Boolean(editing)}
              onClick={() => {
                setSelectedGameId(game.id);
                if (!editing) {
                  setForm((current) => ({ ...current, gameId: game.id }));
                }
              }}
            >
              <img src={pickImage(game)} alt="" />
              <span>{game.name}</span>
            </button>
          ))}
        </div>

        <PanelTitle title="Danh sách gói nạp" />
        <SearchBox value={query} onChange={setQuery} placeholder="Tìm gói nạp..." />

        {loading && games.length === 0 ? (
          <AdminSkeleton rows={6} />
        ) : packagesLoading ? (
          <AdminSkeleton rows={6} />
        ) : !selectedGameId ? (
          <EmptyLine text="Hãy chọn hoặc tạo game trước." />
        ) : scopedPackages.length === 0 ? (
          <EmptyLine text="Game này chưa có gói nạp nào." />
        ) : (
          <div className="admin-table">
            {scopedPackages.map((item) => {
              const isEditing = editing?.id === item.id;

              return (
                <div className={classNames('gametopup-record-row admin-table-row package', isEditing && 'active')} key={item.id}>
                  <img src={pickImage(item)} alt="" />
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {gameName(games, item.gameId)} · Tồn kho {item.stockQuantity}
                    </small>
                  </div>
                  <div className="admin-package-values">
                    <b>{formatCurrency(item.salePrice)}</b>
                    <span className={profit(item) >= 0 ? 'profit' : 'loss'}>Lãi {profit(item) >= 0 ? '+' : ''}{formatCurrency(profit(item))}</span>
                  </div>
                  <StatusPill active={item.isActive} />
                  <div className="flex gap-2">
                    <button type="button" className="icon-button" title="Sửa gói" onClick={() => startEdit(item)}>
                      <Edit3 size={16} />
                    </button>
                    <button type="button" className="icon-button danger" title="Xóa gói" onClick={() => remove(item)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form className="gametopup-surface sticky top-[88px]" onSubmit={submit}>
        <PanelTitle title={editing ? 'Cập nhật gói nạp' : 'Tạo gói nạp'} />

        <div className="mb-4 grid gap-3">
          <Field
            label="Tên gói"
            onChange={(value) => setForm({ ...form, name: value })}
            placeholder="Nhập tên gói"
            required
            value={form.name}
          />
          <Field
            label="Ảnh gói"
            onChange={(value) => setForm({ ...form, imageUrl: value })}
            placeholder="https://..."
            value={form.imageUrl}
          />
          <div className="admin-image-preview">
            {previewSrc ? <img src={previewSrc} alt="Xem trước ảnh gói" /> : <span>Chưa có ảnh</span>}
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <NumberField label="Giá bán" value={form.salePrice} onChange={(salePrice) => setForm({ ...form, salePrice })} />
          <NumberField label="Giá gốc" value={form.originalPrice} onChange={(originalPrice) => setForm({ ...form, originalPrice })} />
          <NumberField label="Giá nhập" value={form.importPrice} onChange={(importPrice) => setForm({ ...form, importPrice })} />
          <NumberField label="Tồn kho" value={form.stockQuantity} onChange={(stockQuantity) => setForm({ ...form, stockQuantity })} />
        </div>

        <label className="mb-4 flex items-center gap-2 font-semibold text-slate-200">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
          <span>Cho phép bán gói này</span>
        </label>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {editing && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              <X size={17} /> Hủy
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={busy || games.length === 0}>
            {editing ? <Save size={17} /> : <Plus size={17} />}
            {editing ? 'Lưu gói' : 'Tạo gói'}
          </button>
        </div>
      </form>
    </div>
  );
}
