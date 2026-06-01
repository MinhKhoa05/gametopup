import { FormEvent, useMemo, useState } from 'react';
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  Edit3,
  Gamepad2,
  LayoutDashboard,
  PackagePlus,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { AsyncActionExecutor } from '../../../hooks/useAsyncAction';
import { createGame, createGamePackage, deleteGame, deleteGamePackage, updateGame, updateGamePackage } from '../services/adminService';
import { useAdminCatalog } from '../hooks/useAdminCatalog';
import { formatCurrency, formatDate } from '../../../lib/format';
import { Route } from '../../../lib/routes';
import { isAdminUser } from '../../../lib/roles';
import { classNames, pickImage } from '../../../lib/ui';
import { statusLabel } from '../../../lib/labels';
import { Game, GamePackage, User } from '../../../types';

type AdminSection = 'dashboard' | 'games' | 'packages';

const emptyGameForm = {
  imageUrl: '',
  isActive: true,
  name: '',
};

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

export function AdminPage({
  busy,
  execute,
  navigate,
  route,
  setError,
  user,
}: {
  busy: boolean;
  execute: AsyncActionExecutor;
  navigate: (route: Route) => void;
  route: Extract<Route, { name: 'admin' }>;
  setError: (message: string | null) => void;
  user: User | null;
}) {
  const catalog = useAdminCatalog(setError);
  const section = route.section ?? 'dashboard';

  if (!isAdminUser(user)) {
    return (
      <div className="admin-shell">
        <div className="admin-empty">
          <span><LayoutDashboard size={26} /></span>
          <h1>Trang quản trị</h1>
          <p>Bạn cần đăng nhập bằng tài khoản Admin để truy cập khu vực này.</p>
          <button type="button" className="btn-primary" onClick={() => navigate({ name: 'account' })}>
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminHeading loading={catalog.loading} onRefresh={catalog.refresh} />

      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label="Điều hướng quản trị">
          <AdminNavButton active={section === 'dashboard'} icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => navigate({ name: 'admin', section: 'dashboard' })} />
          <AdminNavButton active={section === 'games'} icon={<Gamepad2 size={18} />} label="Quản lý game" onClick={() => navigate({ name: 'admin', section: 'games' })} />
          <AdminNavButton active={section === 'packages'} icon={<Boxes size={18} />} label="Gói nạp game" onClick={() => navigate({ name: 'admin', section: 'packages' })} />
        </aside>

        <section className="admin-content">
          {section === 'dashboard' && (
            <DashboardPanel
              games={catalog.games}
              metrics={catalog.metrics}
              orders={catalog.orders}
              packages={catalog.packages}
              loading={catalog.loading}
              navigate={navigate}
            />
          )}

          {section === 'games' && (
            <GamesAdminPanel
              busy={busy}
              execute={execute}
              games={catalog.games}
              loading={catalog.loading}
              onChanged={catalog.refresh}
            />
          )}

          {section === 'packages' && (
            <PackagesAdminPanel
              busy={busy}
              execute={execute}
              games={catalog.games}
              loading={catalog.loading}
              onChanged={catalog.refresh}
              packages={catalog.packages}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function AdminHeading({ loading, onRefresh }: { loading: boolean; onRefresh: () => Promise<void> }) {
  return (
    <div className="admin-heading">
      <div>
        <p className="eyebrow">Admin console</p>
        <h1>Quản trị GameTopUp</h1>
        <p>Theo dõi vận hành, danh mục game và các gói nạp đang bán.</p>
      </div>
      <button type="button" className="btn-outline" onClick={onRefresh} disabled={loading}>
        <RefreshCw size={17} className={classNames(loading && 'animate-spin')} />
        Làm mới
      </button>
    </div>
  );
}

function AdminNavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" className={classNames('admin-nav-button', active && 'active')} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DashboardPanel({
  games,
  loading,
  metrics,
  navigate,
  orders,
  packages,
}: {
  games: Game[];
  loading: boolean;
  metrics: ReturnType<typeof useAdminCatalog>['metrics'];
  navigate: (route: Route) => void;
  orders: ReturnType<typeof useAdminCatalog>['orders'];
  packages: GamePackage[];
}) {
  const latestOrders = orders.slice(0, 5);
  const lowStock = packages.filter((item) => item.stockQuantity <= 10).slice(0, 5);

  return (
    <div className="admin-stack">
      <div className="admin-metrics">
        <MetricCard icon={<Gamepad2 size={20} />} label="Game đang bán" value={`${metrics.activeGames}/${games.length}`} />
        <MetricCard icon={<Boxes size={20} />} label="Gói đang bật" value={`${metrics.activePackages}/${packages.length}`} />
        <MetricCard icon={<PackagePlus size={20} />} label="Sắp hết tồn" value={metrics.lowStockPackages.toString()} tone="warning" />
        <MetricCard icon={<BarChart3 size={20} />} label="Doanh thu ghi nhận" value={formatCurrency(metrics.paidRevenue)} />
      </div>

      <div className="admin-two-col">
        <div className="admin-panel">
          <PanelTitle title="Đơn hàng gần đây" action="Xem đơn" onAction={() => navigate({ name: 'orders' })} />
          {loading ? <AdminSkeleton rows={5} /> : latestOrders.length === 0 ? (
            <EmptyLine text="Chưa có đơn hàng nào." />
          ) : (
            <div className="admin-list">
              {latestOrders.map((order) => (
                <div className="admin-list-row" key={order.id}>
                  <span className="admin-row-icon">#{order.id}</span>
                  <div>
                    <strong>{statusLabel(order.status)}</strong>
                    <small>{order.gameAccountInfo} · {formatDate(order.createdAt)}</small>
                  </div>
                  <b>{formatCurrency(order.total ?? order.unitPrice * order.quantity)}</b>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-panel">
          <PanelTitle title="Gói cần chú ý" action="Quản lý" onAction={() => navigate({ name: 'admin', section: 'packages' })} />
          {loading ? <AdminSkeleton rows={5} /> : lowStock.length === 0 ? (
            <EmptyLine text="Tồn kho các gói đang ổn." />
          ) : (
            <div className="admin-list">
              {lowStock.map((item) => (
                <div className="admin-list-row" key={item.id}>
                  <img src={pickImage(item)} alt="" />
                  <div>
                    <strong>{item.name}</strong>
                    <small>Game ID {item.gameId} · Còn {item.stockQuantity}</small>
                  </div>
                  <b>{formatCurrency(item.salePrice)}</b>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GamesAdminPanel({
  busy,
  execute,
  games,
  loading,
  onChanged,
}: {
  busy: boolean;
  execute: AsyncActionExecutor;
  games: Game[];
  loading: boolean;
  onChanged: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState(emptyGameForm);
  const [query, setQuery] = useState('');
  const filteredGames = useMemo(() => filterByName(games, query), [games, query]);

  function startEdit(game: Game) {
    setEditing(game);
    setForm({ imageUrl: game.imageUrl ?? '', isActive: game.isActive, name: game.name });
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyGameForm);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { ...form, name: form.name.trim(), imageUrl: form.imageUrl.trim() };

    await execute(() => editing ? updateGame(editing.id, payload) : createGame(payload), {
      successMessage: editing ? 'Đã cập nhật game.' : 'Đã tạo game mới.',
      onSuccess: async () => {
        resetForm();
        await onChanged();
      },
    });
  }

  async function remove(game: Game) {
    if (!window.confirm(`Xóa game "${game.name}"?`)) return;

    await execute(() => deleteGame(game.id), {
      successMessage: 'Đã xóa game.',
      onSuccess: onChanged,
    });
  }

  return (
    <div className="admin-editor-layout">
      <div className="admin-panel">
        <PanelTitle title="Danh sách game" />
        <SearchBox value={query} onChange={setQuery} placeholder="Tìm game..." />
        {loading ? <AdminSkeleton rows={6} /> : filteredGames.length === 0 ? (
          <EmptyLine text="Không có game phù hợp." />
        ) : (
          <div className="admin-table">
            {filteredGames.map((game) => (
              <div className="admin-table-row" key={game.id}>
                <img src={pickImage(game)} alt="" />
                <div>
                  <strong>{game.name}</strong>
                  <small>{game.isActive ? 'Đang hiển thị' : 'Đang ẩn'}</small>
                </div>
                <StatusPill active={game.isActive} />
                <div className="admin-actions">
                  <button type="button" className="icon-button" title="Sửa game" onClick={() => startEdit(game)}>
                    <Edit3 size={16} />
                  </button>
                  <button type="button" className="icon-button danger" title="Xóa game" onClick={() => remove(game)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form className="admin-panel admin-form" onSubmit={submit}>
        <PanelTitle title={editing ? 'Cập nhật game' : 'Tạo game'} />
        <label className="field">
          <span>Tên game</span>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label className="field">
          <span>Ảnh đại diện</span>
          <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://..." />
        </label>
        <label className="admin-check">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
          <span>Hiển thị game trong kho</span>
        </label>
        <div className="admin-form-actions">
          {editing && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              <X size={17} /> Hủy
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={busy}>
            {editing ? <Save size={17} /> : <Plus size={17} />}
            {editing ? 'Lưu game' : 'Tạo game'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PackagesAdminPanel({
  busy,
  execute,
  games,
  loading,
  onChanged,
  packages,
}: {
  busy: boolean;
  execute: AsyncActionExecutor;
  games: Game[];
  loading: boolean;
  onChanged: () => Promise<void>;
  packages: GamePackage[];
}) {
  const [editing, setEditing] = useState<GamePackage | null>(null);
  const [form, setForm] = useState(emptyPackageForm);
  const [query, setQuery] = useState('');
  const filteredPackages = useMemo(() => filterByName(packages, query), [packages, query]);

  function startEdit(item: GamePackage) {
    setEditing(item);
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
    setForm({ ...emptyPackageForm, gameId: games[0]?.id ?? 0 });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      ...form,
      gameId: form.gameId || games[0]?.id || 0,
      imageUrl: form.imageUrl.trim(),
      name: form.name.trim(),
    };

    await execute(
      () => editing ? updateGamePackage(editing.id, {
        imageUrl: payload.imageUrl,
        importPrice: payload.importPrice,
        isActive: payload.isActive,
        name: payload.name,
        originalPrice: payload.originalPrice,
        salePrice: payload.salePrice,
        stockQuantity: payload.stockQuantity,
      }) : createGamePackage(payload),
      {
        successMessage: editing ? 'Đã cập nhật gói nạp.' : 'Đã tạo gói nạp mới.',
        onSuccess: async () => {
          resetForm();
          await onChanged();
        },
      },
    );
  }

  async function remove(item: GamePackage) {
    if (!window.confirm(`Xóa gói "${item.name}"?`)) return;

    await execute(() => deleteGamePackage(item.id), {
      successMessage: 'Đã xóa gói nạp.',
      onSuccess: onChanged,
    });
  }

  return (
    <div className="admin-editor-layout">
      <div className="admin-panel">
        <PanelTitle title="Danh sách gói nạp" />
        <SearchBox value={query} onChange={setQuery} placeholder="Tìm gói nạp..." />
        {loading ? <AdminSkeleton rows={6} /> : filteredPackages.length === 0 ? (
          <EmptyLine text="Không có gói nạp phù hợp." />
        ) : (
          <div className="admin-table">
            {filteredPackages.map((item) => (
              <div className="admin-table-row package" key={item.id}>
                <img src={pickImage(item)} alt="" />
                <div>
                  <strong>{item.name}</strong>
                  <small>{gameName(games, item.gameId)} · Tồn {item.stockQuantity}</small>
                </div>
                <b>{formatCurrency(item.salePrice)}</b>
                <StatusPill active={item.isActive} />
                <div className="admin-actions">
                  <button type="button" className="icon-button" title="Sửa gói" onClick={() => startEdit(item)}>
                    <Edit3 size={16} />
                  </button>
                  <button type="button" className="icon-button danger" title="Xóa gói" onClick={() => remove(item)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form className="admin-panel admin-form" onSubmit={submit}>
        <PanelTitle title={editing ? 'Cập nhật gói nạp' : 'Tạo gói nạp'} />
        <label className="field">
          <span>Tên gói</span>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label className="field">
          <span>Game</span>
          <select value={form.gameId || games[0]?.id || 0} onChange={(event) => setForm({ ...form, gameId: Number(event.target.value) })} disabled={Boolean(editing)} required>
            <option value={0} disabled>Chọn game</option>
            {games.map((game) => (
              <option value={game.id} key={game.id}>{game.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Ảnh gói</span>
          <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://..." />
        </label>
        <div className="admin-form-grid">
          <NumberField label="Giá bán" value={form.salePrice} onChange={(salePrice) => setForm({ ...form, salePrice })} />
          <NumberField label="Giá gốc" value={form.originalPrice} onChange={(originalPrice) => setForm({ ...form, originalPrice })} />
          <NumberField label="Giá nhập" value={form.importPrice} onChange={(importPrice) => setForm({ ...form, importPrice })} />
          <NumberField label="Tồn kho" value={form.stockQuantity} onChange={(stockQuantity) => setForm({ ...form, stockQuantity })} />
        </div>
        <label className="admin-check">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
          <span>Cho phép bán gói này</span>
        </label>
        <div className="admin-form-actions">
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

function MetricCard({ icon, label, tone, value }: { icon: React.ReactNode; label: string; tone?: 'warning'; value: string }) {
  return (
    <div className={classNames('admin-metric-card', tone === 'warning' && 'warning')}>
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function PanelTitle({ action, onAction, title }: { action?: string; onAction?: () => void; title: string }) {
  return (
    <div className="admin-panel-title">
      <h2>{title}</h2>
      {action && (
        <button type="button" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

function SearchBox({ onChange, placeholder, value }: { onChange: (value: string) => void; placeholder: string; value: string }) {
  return (
    <div className="search-box admin-search">
      <Search size={17} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span className={classNames('admin-status-pill', active ? 'active' : 'inactive')}>
      {active ? <CheckCircle2 size={14} /> : <X size={14} />}
      {active ? 'Bật' : 'Tắt'}
    </span>
  );
}

function NumberField({ label, onChange, value }: { label: string; onChange: (value: number) => void; value: number }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input min={0} type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} required />
    </label>
  );
}

function AdminSkeleton({ rows }: { rows: number }) {
  return (
    <div className="admin-skeleton" aria-busy="true" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <div className="admin-empty-line">{text}</div>;
}

function filterByName<T extends { name: string }>(items: T[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => item.name.toLowerCase().includes(normalized));
}

function gameName(games: Game[], gameId: number) {
  return games.find((game) => game.id === gameId)?.name ?? `Game ID ${gameId}`;
}
