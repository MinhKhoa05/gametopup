import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Gamepad2, Heart, Search, Sparkles, Star } from 'lucide-react';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { routes } from '@/app/router/routes';
import type { Game } from '@/features/games/types';
import { useGamesQuery } from '@/features/games/server';
import {
  buildFeaturedGameIds,
  getGamePlatformLabel,
  getGameTopupLabel,
  matchesCategory,
  matchesPlatform,
  sortCatalogGames,
  type CatalogCategoryFilter,
  type CatalogPlatformFilter,
  type CatalogSortKey,
} from '@/features/games/lib/catalog';
import { Badge, Button, IconBox, ImageBox, EmptyState } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';

const PLATFORM_OPTIONS: Array<{ value: CatalogPlatformFilter; label: string }> = [
  { value: 'all', label: 'Nền tảng: Tất cả' },
  { value: 'mobile', label: 'Nền tảng: Mobile' },
  { value: 'pc', label: 'Nền tảng: PC' },
  { value: 'console', label: 'Nền tảng: Console' },
];

const CATEGORY_OPTIONS: Array<{ value: CatalogCategoryFilter; label: string }> = [
  { value: 'all', label: 'Danh mục: Tất cả' },
  { value: 'featured', label: 'Danh mục: Nổi bật' },
  { value: 'mobile', label: 'Danh mục: Mobile' },
  { value: 'pc', label: 'Danh mục: PC' },
  { value: 'console', label: 'Danh mục: Console' },
  { value: 'international', label: 'Danh mục: Quốc tế' },
];

const SORT_OPTIONS: Array<{ value: CatalogSortKey; label: string }> = [
  { value: 'featured', label: 'Sắp xếp: Phổ biến' },
  { value: 'newest', label: 'Sắp xếp: Mới nhất' },
  { value: 'name', label: 'Sắp xếp: Tên A-Z' },
];

const QUICK_TAGS: Array<{ value: CatalogCategoryFilter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'featured', label: 'Nổi bật' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'pc', label: 'PC' },
  { value: 'console', label: 'Console' },
];

const PANEL_CLASS =
  'rounded-[26px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(22,27,34,0.95),rgba(18,24,34,0.98))] shadow-[0_16px_38px_rgba(2,6,23,0.18)]';

export function GamesPage() {
  const navigate = useNavigate();
  const gamesQuery = useGamesQuery();

  const games = gamesQuery.data ?? [];
  const featuredGameIds = useMemo(() => buildFeaturedGameIds(games), [games]);

  const [query, setQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<CatalogPlatformFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CatalogCategoryFilter>('all');
  const [sortKey, setSortKey] = useState<CatalogSortKey>('featured');

  const filteredGames = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    const matched = games.filter((game) => {
      if (!matchesPlatform(game, platformFilter)) return false;
      if (!matchesCategory(game, categoryFilter, featuredGameIds)) return false;
      if (!keyword) return true;

      const searchable = `${game.name} ${getGameTopupLabel(game)}`.toLowerCase();
      return searchable.includes(keyword);
    });

    return sortCatalogGames(matched, sortKey, featuredGameIds);
  }, [categoryFilter, featuredGameIds, games, platformFilter, query, sortKey]);

  const activeCount = filteredGames.length;

  return (
    <AppPageContainer className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-6">
          <header className={PANEL_CLASS}>
            <div className="grid gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
              <div className="flex items-start gap-4">
                <IconBox size="lg" className="h-[62px] w-[62px] rounded-[18px] border-cyan/20 bg-cyan/10 text-cyan-50">
                  <Gamepad2 size={30} strokeWidth={1.8} />
                </IconBox>
                <div className="grid gap-2">
                  <p className="m-0 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">KHO GAME</p>
                  <h1 className="m-0 text-[clamp(2.3rem,3.3vw,3.6rem)] font-black leading-[0.96] tracking-[-0.06em] text-white text-balance">
                    Kho game
                  </h1>
                  <p className="max-w-3xl text-[0.98rem] leading-7 text-slate-400">
                    Khám phá và nạp ngay cho tựa game yêu thích của bạn.
                  </p>
                </div>
              </div>
            </div>
          </header>

          <section className={PANEL_CLASS}>
            <div className="grid gap-4 px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
              <div className="grid gap-3 xl:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
                <SearchField value={query} onChange={setQuery} />
                <SelectField value={platformFilter} onChange={(value) => setPlatformFilter(value as CatalogPlatformFilter)}>
                  {PLATFORM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField value={categoryFilter} onChange={(value) => setCategoryFilter(value as CatalogCategoryFilter)}>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField value={sortKey} onChange={(value) => setSortKey(value as CatalogSortKey)}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {QUICK_TAGS.map((tag) => {
                  const active = tag.value === categoryFilter;

                  return (
                    <button
                      key={tag.value}
                      type="button"
                      className={classNames(
                        'inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition-all duration-200',
                        active
                          ? 'border-cyan/35 bg-cyan/12 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]'
                          : 'border-white/10 bg-white/[0.04] text-slate-300 hover:-translate-y-px hover:border-cyan/20 hover:bg-cyan/10 hover:text-cyan-50',
                      )}
                      onClick={() => setCategoryFilter(tag.value)}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {gamesQuery.isPending && !games.length ? (
            <GameCatalogGrid loading />
          ) : activeCount ? (
            <>
              <section className="grid gap-3">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="m-0 text-[1.25rem] font-black tracking-[-0.03em] text-white">Lưới game</h2>
                  <span className="text-sm text-slate-400 gt-tabular">{activeCount} game</span>
                </div>
                <GameCatalogGrid games={filteredGames} onPick={(game) => navigate(routes.gameDetail(game.id))} />
              </section>
            </>
          ) : (
            <EmptyState
              title="Không tìm thấy trò chơi phù hợp"
              description="Thử đổi bộ lọc, bỏ từ khóa hoặc chuyển sang nhóm game khác."
              actionLabel="Đặt lại bộ lọc"
              onAction={() => {
                setQuery('');
                setPlatformFilter('all');
                setCategoryFilter('all');
                setSortKey('featured');
              }}
              variant="spacious"
              className="mx-auto w-full max-w-2xl"
            />
          )}
        </div>
    </AppPageContainer>
  );
}

function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-h-14 items-center gap-3 rounded-[18px] border border-white/10 bg-[rgba(7,16,31,0.72)] px-4 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-cyan/10 focus-within:border-cyan/60 focus-within:bg-[rgba(10,24,44,0.92)] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]">
      <Search size={18} className="shrink-0 text-slate-400" />
      <input
        className="w-full border-0 bg-transparent p-0 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-0"
        placeholder="Tìm kiếm game..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  children,
  onChange,
  value,
}: {
  children: ReactNode;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="relative flex min-h-14 items-center rounded-[18px] border border-white/10 bg-[rgba(7,16,31,0.72)] px-4 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-cyan/10 focus-within:border-cyan/60 focus-within:bg-[rgba(10,24,44,0.92)] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]">
      <select
        className="w-full appearance-none border-0 bg-transparent p-0 pr-7 text-sm font-medium text-white outline-none focus:ring-0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-4 text-slate-500" />
    </label>
  );
}

function GameCatalogGrid({
  games = [],
  loading = false,
  onPick,
}: {
  games?: Game[];
  loading?: boolean;
  onPick?: (game: Game) => void;
}) {
  const skeletonCount = 8;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {loading
        ? Array.from({ length: skeletonCount }).map((_, index) => <GameCardSkeleton key={index} />)
        : games.map((game) => <GameCard key={game.id} game={game} onPick={() => onPick?.(game)} />)}
    </div>
  );
}

function GameCard({
  game,
  onPick,
}: {
  game: Game;
  onPick?: () => void;
}) {
  const platformLabel = getGamePlatformLabel(game);
  const topupLabel = getGameTopupLabel(game);

  return (
    <article className="group grid h-full gap-3 rounded-[22px] border border-white/[0.08] bg-[rgba(22,27,34,0.9)] p-3 transition-all duration-200 hover:-translate-y-1 hover:border-cyan/25 hover:bg-[rgba(24,32,44,0.98)] hover:shadow-[0_18px_36px_rgba(2,6,23,0.2)]">
      <div className="relative overflow-hidden rounded-[18px] bg-slate-950">
        <div className="relative h-[220px] overflow-hidden">
          <ImageBox src={game.imageUrl} alt={game.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.02)_0%,rgba(2,6,23,0.12)_42%,rgba(2,6,23,0.82)_100%)]" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.03] transition-colors group-hover:ring-cyan/20" />
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 px-1">
        <Badge variant="accent" className="w-fit rounded-full px-2.5 py-1 text-[0.72rem] font-bold">
          {platformLabel}
        </Badge>
        <button
          type="button"
          aria-label="Yêu thích"
          className="inline-flex size-8 items-center justify-center justify-self-end rounded-full border border-white/10 bg-transparent text-slate-300 transition-colors hover:border-cyan/25 hover:bg-cyan/10 hover:text-cyan-50"
        >
          <Heart size={16} />
        </button>
        <div className="col-span-2 grid gap-0.5">
          <h3 className="m-0 text-base font-black text-white">{game.name}</h3>
          <p className="m-0 text-sm leading-6 text-slate-400">Nạp {topupLabel}</p>
        </div>
      </div>

      <Button
        variant="primary"
        className="translate-y-3 justify-center rounded-[14px] px-4 text-sm font-bold opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        onClick={onPick}
      >
        Nạp ngay
        <Sparkles size={16} />
      </Button>
    </article>
  );
}

function GameCardSkeleton() {
  return (
    <article className="grid gap-3 rounded-[22px] border border-white/[0.08] bg-[rgba(22,27,34,0.9)] p-3" aria-hidden="true">
      <div className="relative overflow-hidden rounded-[18px] bg-slate-950">
        <div className="h-[220px] animate-pulse bg-white/6" />
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 px-1">
        <div className="h-6 w-14 animate-pulse rounded-full bg-white/10" />
        <div className="size-8 animate-pulse rounded-full bg-white/10 justify-self-end" />
        <div className="col-span-2 grid gap-2">
          <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
          <div className="h-3.5 w-20 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
      <div className="h-11 w-full animate-pulse rounded-[14px] bg-white/10" />
    </article>
  );
}
