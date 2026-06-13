import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Heart,
  Search,
  Star,
} from 'lucide-react';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { SITE_IMAGES } from '@/app/config/site';
import { routes } from '@/app/router/routes';
import { Badge, Button, IconBox, ImageBox, PageHero, TrustSection } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import { useGamesQuery } from '../server';
import { GameGrid } from '../components/GameGrid';
import {
  buildFeaturedGameIds,
  getGameTopupLabel,
  matchesCategory,
  matchesPlatform,
  sortCatalogGames,
  type CatalogCategoryFilter,
  type CatalogPlatformFilter,
  type CatalogSortKey,
} from '../lib/catalog';

const PAGE_SIZE = 10;

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
  { value: 'international', label: 'Danh mục: Phiên bản quốc tế' },
];

const SORT_OPTIONS: Array<{ value: CatalogSortKey; label: string }> = [
  { value: 'featured', label: 'Sắp xếp: Phổ biến' },
  { value: 'newest', label: 'Sắp xếp: Mới nhất' },
  { value: 'name', label: 'Sắp xếp: Tên A-Z' },
];

const CATEGORY_CHIPS: Array<{ value: CatalogCategoryFilter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'featured', label: '🔥 Nổi bật' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'pc', label: 'PC' },
  { value: 'console', label: 'Console' },
  { value: 'international', label: 'Phiên bản quốc tế' },
];

export function GamesPage() {
  const navigate = useNavigate();
  const gamesQuery = useGamesQuery();

  const games = gamesQuery.data ?? [];
  const featuredGameIds = useMemo(() => buildFeaturedGameIds(games), [games]);

  const [query, setQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<CatalogPlatformFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CatalogCategoryFilter>('all');
  const [sortKey, setSortKey] = useState<CatalogSortKey>('featured');
  const [page, setPage] = useState(1);

  const filteredGames = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    const matched = games.filter((game) => {
      if (!matchesPlatform(game, platformFilter)) {
        return false;
      }

      if (!matchesCategory(game, categoryFilter, featuredGameIds)) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const searchable = `${game.name} ${getGameTopupLabel(game)}`.toLowerCase();
      return searchable.includes(keyword);
    });

    return sortCatalogGames(matched, sortKey, featuredGameIds);
  }, [categoryFilter, featuredGameIds, games, platformFilter, query, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredGames.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="relative isolate overflow-hidden">
      <BackgroundDecor />

      <AppPageContainer className="relative z-10 py-5 sm:py-7 lg:py-9">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 lg:gap-5">
          <GameHeaderSection />

          <SearchSection
            query={query}
            onQueryChange={setQuery}
            platformFilter={platformFilter}
            onPlatformFilterChange={setPlatformFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            sortKey={sortKey}
            onSortKeyChange={setSortKey}
          />

          <section className="grid gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {CATEGORY_CHIPS.map((chip) => {
                const isActive = chip.value === categoryFilter;

                return (
                  <button
                    key={chip.value}
                    type="button"
                    className={classNames(
                      'inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'border-cyan/35 bg-cyan/12 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:-translate-y-px hover:border-cyan/20 hover:bg-cyan/10 hover:text-cyan-50',
                    )}
                    onClick={() => setCategoryFilter(chip.value)}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </section>

          {gamesQuery.isPending && !games.length ? (
            <GameGrid
              games={[]}
              loading
              skeletonCount={10}
              onPick={() => undefined}
            />
          ) : filteredGames.length ? (
            <>
              <GameGrid
                games={pageItems}
                onPick={(game) => navigate(routes.topup(game.id, 1))}
              />

              {totalPages > 1 ? (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
              ) : null}
            </>
          ) : (
            <EmptyState
              title="Không tìm thấy trò chơi phù hợp."
              description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
              actionLabel="Đặt lại bộ lọc"
              onAction={() => {
                setQuery('');
                setPlatformFilter('all');
                setCategoryFilter('all');
                setSortKey('featured');
                setPage(1);
              }}
            />
          )}

          <TrustSection />
        </div>
      </AppPageContainer>
    </div>
  );
}

function HeaderSection() {
  return (
    <section className="gt-surface relative overflow-hidden rounded-[18px] border border-cyan/10 bg-[linear-gradient(180deg,rgba(7,16,31,0.88),rgba(4,10,22,0.96))] px-5 py-6 shadow-[0_12px_30px_rgba(2,6,23,0.18)] sm:px-6 sm:py-7 lg:px-7 lg:py-8">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none absolute left-[42%] top-1/2 h-[19rem] w-[19rem] -translate-y-1/2 rounded-full bg-cyan/12 blur-[112px] lg:left-[46%] lg:h-[24rem] lg:w-[24rem]" />
      <div className="pointer-events-none absolute left-[8%] top-[12%] h-28 w-28 rounded-full bg-cyan/12 blur-[72px] mix-blend-screen" />
      <div className="pointer-events-none absolute inset-x-[18%] bottom-[10%] h-12 rounded-full bg-cyan/10 blur-[42px] mix-blend-screen" />

      <div className="relative grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.78fr)] lg:gap-8">
        <div className="grid gap-5 pt-2 lg:pt-4">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="accent" className="w-fit rounded-full border-cyan/20 bg-cyan/10 px-3 py-1 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">
              KHO GAME
            </Badge>
          </div>

          <div className="flex items-start gap-4">
            <IconBox size="lg" className="h-[62px] w-[62px] rounded-[18px] border-cyan/20 bg-cyan/10 text-cyan-50">
              <Gamepad2 size={31} strokeWidth={1.8} />
            </IconBox>
            <div className="grid gap-3 pt-0.5">
              <h1 className="m-0 whitespace-nowrap text-[clamp(2.45rem,3.25vw,3.7rem)] font-black leading-[0.92] tracking-[-0.05em] text-white">
                Kho game
              </h1>
              <p className="mt-2 max-w-2xl text-[0.96rem] leading-7 text-slate-400">
                Khám phá và nạp ngay cho tựa game yêu thích của bạn.
              </p>
              <Button variant="outline" className="w-fit rounded-[14px] px-4 text-sm font-medium text-white">
                <Heart size={16} />
                Yêu thích
              </Button>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[220px] items-center justify-center overflow-visible lg:min-h-[260px]">
          <div className="pointer-events-none absolute left-[50%] top-[52%] h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/18 blur-[100px]" />
          <div className="pointer-events-none absolute left-[12%] top-[18%] h-24 w-24 rounded-full bg-cyan/18 blur-[70px] mix-blend-screen" />
          <div className="pointer-events-none absolute right-[14%] top-[10%] h-16 w-16 rounded-full bg-blue-400/10 blur-[42px] mix-blend-screen" />
          <div className="pointer-events-none absolute left-[16%] top-[44%] h-px w-[62%] bg-gradient-to-r from-cyan/0 via-cyan/32 to-cyan/0" />

          <ImageBox
            src={SITE_IMAGES.games.heroIllustration}
            alt="Minh họa game GameTopUp"
            className="relative z-10 w-full max-w-[420px] object-contain object-center drop-shadow-[0_0_44px_rgba(34,211,238,0.2)]"
            decoding="async"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}

function GameHeaderSection() {
  return (
    <PageHero
      icon={
        <IconBox size="lg" className="h-[68px] w-[68px] rounded-[20px] border-cyan/18 bg-cyan/10 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.06)]">
          <Gamepad2 size={36} strokeWidth={1.8} />
        </IconBox>
      }
      title="Kho game"
      description="Khám phá và nạp ngay cho tựa game yêu thích của bạn."
      illustration={
        <ImageBox
          src={SITE_IMAGES.games.heroIllustration}
          alt="Minh họa game GameTopUp"
          className="relative z-10 w-full max-w-[330px] -translate-y-1 object-contain object-center drop-shadow-[0_0_30px_rgba(34,211,238,0.14)] lg:max-w-[320px]"
          decoding="async"
          loading="eager"
        />
      }
    >
      <div className="absolute bottom-4 left-5 z-20 flex flex-wrap gap-2 sm:bottom-5 sm:left-6 lg:bottom-5 lg:left-7">
        <Button variant="outline" className="w-fit rounded-[14px] px-4 text-sm font-medium text-white">
          <Heart size={16} />
          Yêu thích
        </Button>
        <Button variant="secondary" className="w-fit rounded-[14px] px-4 text-sm font-medium text-white">
          <Star size={16} />
          Nổi bật
        </Button>
      </div>
    </PageHero>
  );
}

function SearchSection({
  query,
  onQueryChange,
  platformFilter,
  onPlatformFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortKey,
  onSortKeyChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  platformFilter: CatalogPlatformFilter;
  onPlatformFilterChange: (value: CatalogPlatformFilter) => void;
  categoryFilter: CatalogCategoryFilter;
  onCategoryFilterChange: (value: CatalogCategoryFilter) => void;
  sortKey: CatalogSortKey;
  onSortKeyChange: (value: CatalogSortKey) => void;
}) {
  return (
    <section className="gt-surface rounded-[18px] border border-white/10 p-4 shadow-[0_12px_26px_rgba(2,6,23,0.12)] sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_repeat(3,minmax(0,1fr))]">
        <SearchField value={query} onChange={onQueryChange} />

        <SelectField
          value={platformFilter}
          onChange={(value) => onPlatformFilterChange(value as CatalogPlatformFilter)}
        >
          {PLATFORM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          value={categoryFilter}
          onChange={(value) => onCategoryFilterChange(value as CatalogCategoryFilter)}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <SelectField value={sortKey} onChange={(value) => onSortKeyChange(value as CatalogSortKey)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </div>
    </section>
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
    <label className="flex min-h-14 items-center gap-3 rounded-[14px] border border-white/10 bg-white/5 px-4 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-cyan/10 focus-within:border-cyan/70 focus-within:bg-cyan/10 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]">
      <Search size={18} className="shrink-0 text-slate-300" />
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
    <label className="relative flex min-h-14 items-center rounded-[14px] border border-white/10 bg-white/5 px-4 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-cyan/10 focus-within:border-cyan/70 focus-within:bg-cyan/10 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]">
      <select
        className="w-full appearance-none border-0 bg-transparent p-0 pr-7 text-sm font-medium text-white outline-none focus:ring-0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-4 text-slate-400" />
    </label>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <section className="gt-surface grid gap-4 rounded-[18px] border border-white/10 p-6">
      <div className="grid gap-2">
        <h2 className="m-0 text-[1.3rem] font-black tracking-[-0.03em] text-white">{title}</h2>
        <p className="m-0 text-sm leading-7 text-slate-400">{description}</p>
      </div>

      <Button variant="primary" className="w-fit rounded-[14px] px-5 text-sm font-bold" onClick={onAction}>
        {actionLabel}
      </Button>
    </section>
  );
}

function Pagination({
  currentPage,
  onPageChange,
  totalPages,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}) {
  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Phân trang kho game">
      <IconPagerButton label="Trang trước" disabled={currentPage <= 1} onClick={() => onPageChange(Math.max(1, currentPage - 1))}>
        <ChevronLeft size={16} />
      </IconPagerButton>

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="inline-flex h-10 min-w-10 items-center justify-center px-2 text-sm font-bold text-slate-500">
            ...
          </span>
        ) : (
          (() => {
            const pageNumber = page as number;

            return (
              <PageNumberButton key={pageNumber} active={pageNumber === currentPage} onClick={() => onPageChange(pageNumber)}>
                {pageNumber}
              </PageNumberButton>
            );
          })()
        ),
      )}

      <IconPagerButton label="Trang sau" disabled={currentPage >= totalPages} onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}>
        <ChevronRight size={16} />
      </IconPagerButton>
    </nav>
  );
}

function IconPagerButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-slate-300 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-cyan/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function PageNumberButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={classNames(
        'inline-flex h-10 min-w-10 items-center justify-center rounded-[10px] border px-3 text-sm font-bold transition-all duration-200',
        active
          ? 'border-cyan-400/40 bg-cyan text-slate-950 shadow-[0_8px_20px_rgba(34,211,238,0.18)]'
          : 'border-white/10 bg-white/5 text-slate-300 hover:-translate-y-px hover:border-cyan/25 hover:bg-cyan/10 hover:text-cyan-50',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function BackgroundDecor() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent_18%),radial-gradient(circle_at_50%_-10%,rgba(15,118,110,0.14),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:64px_64px]" />
    </>
  );
}

function getPaginationPages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}
