import { CheckCircle2, Search, X } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { SectionHeading } from '../../../components/common/SectionHeading';
import { EmptyState } from '../../../components/common/EmptyState';
import { classNames } from '../../../lib/ui';

export function PanelTitle({
  action,
  onAction,
  title,
}: {
  action?: string;
  onAction?: () => void;
  title: string;
}) {
  return (
    <SectionHeading>
      <div className="section-heading__copy">
        <h2 className="section-heading__title">{title}</h2>
      </div>
      {action && (
        <button type="button" className="section-heading__action" onClick={onAction}>
          {action}
        </button>
      )}
    </SectionHeading>
  );
}

export function SearchBox({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <div className="search-box admin-search">
      <Search size={17} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <Badge
      className={classNames('admin-status-pill', active ? 'active' : 'inactive')}
      icon={active ? <CheckCircle2 size={14} /> : <X size={14} />}
      tone={active ? 'success' : 'info'}
    >
      {active ? 'Bật' : 'Tắt'}
    </Badge>
  );
}

export function NumberField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input min={0} type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} required />
    </label>
  );
}

export function AdminSkeleton({ rows }: { rows: number }) {
  return (
    <div className="admin-skeleton" aria-busy="true" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

export function EmptyLine({ text }: { text: string }) {
  return (
    <EmptyState className="admin-empty-line">
      <span>{text}</span>
    </EmptyState>
  );
}

export function filterByName<T extends { name: string }>(items: T[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => item.name.toLowerCase().includes(normalized));
}

export function gameName(games: Array<{ id: number; name: string }>, gameId: number) {
  return games.find((game) => game.id === gameId)?.name ?? `Game #${gameId}`;
}
