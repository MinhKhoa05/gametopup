import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Heart,
  Search,
  ShieldCheck,
  Tag,
  Zap,
  Headset,
} from 'lucide-react';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { routes } from '@/app/router/routes';
import { Badge, Button, IconBox } from '@/shared/components';
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

const BENEFITS = [
  {
    title: 'Giá tốt hơn',
    description: 'Tiết kiệm đến 15% so với cửa hàng chính thức.',
    icon: <Tag size={24} />,
  },
  {
    title: 'Thanh toán an toàn',
    description: 'Bảo mật thông tin tuyệt đối, hỗ trợ nhiều phương thức.',
    icon: <ShieldCheck size={24} />,
  },
  {
    title: 'Xử lý nhanh chóng',
    description: 'Đơn được xử lý tự động 5 - 15 phút.',
    icon: <Zap size={24} />,
  },
  {
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn.',
    icon: <Headset size={24} />,
  },
] as const;

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
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 lg:gap-7">
          <HeaderSection />

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

          <BenefitsSection />
        </div>
      </AppPageContainer>
    </div>
  );
}

function HeaderSection() {
  return (
    <section className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5">
      <div className="flex items-start gap-4">
        <IconBox size="lg" className="h-[62px] w-[62px] rounded-[18px] border-cyan/20 bg-cyan/10 text-cyan-50">
          <Gamepad2 size={31} strokeWidth={1.8} />
        </IconBox>
        <div className="pt-0.5">
          <h1 className="m-0 text-[clamp(2.25rem,3.5vw,3.25rem)] font-black leading-[0.92] tracking-[-0.04em] text-white">
            Kho game
          </h1>
          <p className="mt-2 max-w-2xl text-[0.96rem] leading-7 text-slate-400">
            Khám phá và nạp ngay cho tựa game yêu thích của bạn.
          </p>
        </div>
      </div>

      <div />

      <Button variant="outline" className="rounded-[14px] px-4 text-sm font-medium text-white">
        <Heart size={16} />
        Yêu thích
      </Button>
    </section>
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
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.9fr)_repeat(3,minmax(0,1fr))]">
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

function BenefitsSection() {
  return (
    <section className="gt-surface overflow-hidden rounded-[18px] border border-white/10 p-0">
      <div className="grid divide-y divide-white/10 xl:grid-cols-4 xl:divide-x xl:divide-y-0">
        {BENEFITS.map((benefit) => (
          <article key={benefit.title} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 px-7 py-5">
            <IconBox size="sm" className="h-12 w-12 rounded-[16px] border-cyan/20 bg-cyan/10 text-cyan-50">
              {benefit.icon}
            </IconBox>
            <div className="grid gap-1">
              <h3 className="text-base font-black text-white">{benefit.title}</h3>
              <p className="m-0 text-sm leading-6 text-slate-400">{benefit.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
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
