import { useEffect } from 'react';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import { useRoute } from '@/hooks/common/route.hooks';
import { useAuthSession } from '@/features/auth/hooks/auth.hooks';
import { useWalletQuery } from '@/features/wallet/api/wallet';
import { EmptyState, StepProgress } from '@/components/ui';
import { classNames } from '@/lib/ui';
import { GameOrderPackageStep, PackageGridSkeleton } from './GameOrderPackageStep';
import { GameOrderReviewStep } from './GameOrderReviewStep';
import { GameOrderSuccessStep } from './GameOrderSuccessStep';
import { useGameOrderGame, useGameOrderPackages } from '@/features/topup/hooks/topup.hooks';
import { useGameOrderStore } from '@/features/topup/store/topup.store';

const ORDER_STEPS = [
  {
    icon: <span className="text-sm font-black tabular-nums">1</span>,
    title: 'Chọn gói & nhập thông tin',
  },
  {
    icon: <span className="text-sm font-black tabular-nums">2</span>,
    title: 'Thanh toán',
  },
  {
    icon: <span className="text-sm font-black tabular-nums">3</span>,
    title: 'Đặt hàng thành công',
  },
] as const;

type Props = {
  gameId: number;
};

export function GameOrderWizard({ gameId }: Props) {
  const { navigate, route } = useRoute();
  const gameQuery = useGameOrderGame(gameId);
  const packagesQuery = useGameOrderPackages(gameId);
  const auth = useAuthSession();
  const user = auth.user;
  const walletQuery = useWalletQuery(auth.isLoggedIn);
  const wallet = walletQuery.data ?? null;
  const step = useGameOrderStore((state) => state.step);
  const activeGameId = useGameOrderStore((state) => state.activeGameId);
  const selectedPackageId = useGameOrderStore((state) => state.selectedPackageId);
  const setActiveGameId = useGameOrderStore((state) => state.setActiveGameId);
  const setSelectedPackageId = useGameOrderStore((state) => state.setSelectedPackageId);
  const setStep = useGameOrderStore((state) => state.setStep);
  const resetWizard = useGameOrderStore((state) => state.resetWizard);
  const routeStep = route.name === 'games' ? route.step : undefined;
  const currentStep = routeStep ?? step;

  const game = gameQuery.isPlaceholderData ? null : gameQuery.data ?? null;
  const packages = packagesQuery.isPlaceholderData ? [] : packagesQuery.data ?? [];
  const isFirstStep = currentStep === 1;

  useEffect(() => {
    if (activeGameId !== gameId) {
      resetWizard();
      setActiveGameId(gameId);
    }
  }, [activeGameId, gameId, resetWizard, setActiveGameId]);

  useEffect(() => {
    if (activeGameId !== gameId || routeStep === undefined) {
      if (activeGameId === gameId && routeStep === undefined) {
        navigate({ name: 'games', gameId, step }, { replace: true });
      }

      return;
    }

    if (routeStep !== step) {
      setStep(routeStep);
    }
  }, [activeGameId, gameId, navigate, routeStep, setStep, step]);

  useEffect(() => {
    if (packagesQuery.isPlaceholderData) {
      return;
    }

    if (packages.length === 0) {
      if (selectedPackageId !== null) {
        setSelectedPackageId(null);
      }
      return;
    }

    const isValid = packages.some((pkg) => pkg.id === selectedPackageId);
    if (!isValid) {
      setSelectedPackageId(packages[0]?.id ?? null);
    }
  }, [packages, packagesQuery.isPlaceholderData, selectedPackageId, setSelectedPackageId]);

  if (gameQuery.isPlaceholderData || (gameQuery.isPending && !gameQuery.data)) {
    return <GameOrderSkeleton />;
  }

  if (!game) {
    return <EmptyState>Không tìm thấy game.</EmptyState>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex items-center gap-2 text-sm text-slate-400">
        <Home size={16} />
        <span>Đơn hàng</span>
        <ChevronRight size={14} />
        <span className="font-bold text-white">{game.name}</span>
      </div>

      <div className="gt-surface p-5 sm:p-6">
        <StepProgress currentStep={currentStep} steps={ORDER_STEPS} />
        <button
          className="mb-4 inline-flex items-center gap-2 border-0 bg-transparent p-0 text-sm font-bold text-slate-400 hover:text-cyan-50"
          type="button"
          onClick={() => {
            if (isFirstStep) {
              navigate({ name: 'games' });
              return;
            }

            navigate({ name: 'games', gameId, step: (currentStep - 1) as 1 | 2 | 3 });
          }}
        >
          <ArrowLeft size={15} />
          {isFirstStep ? 'Quay lại danh sách game' : 'Quay lại bước trước'}
        </button>

        <div>
          {currentStep === 1 && (
            <GameOrderPackageStep
              game={game}
              packages={packages}
              isLoading={packagesQuery.isPending && !packagesQuery.data}
              user={user}
            />
          )}
          {currentStep === 2 && (
            <GameOrderReviewStep
              game={game}
              user={user}
              wallet={wallet}
              walletLoading={walletQuery.isPending && !walletQuery.data}
            />
          )}
          {currentStep === 3 && <GameOrderSuccessStep />}
        </div>
      </div>
    </div>
  );
}

function GameOrderSkeleton() {
  return (
    <div className="mx-auto max-w-6xl" aria-busy="true" aria-label="Đang tải trang đặt hàng">
      <div className="mb-5 flex items-center gap-2 text-sm text-slate-400">
        <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-36 animate-pulse rounded-full bg-white/10" />
      </div>

      <div className="gt-surface p-5 sm:p-6">
        <div className="topup-steps" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`step-skeleton-${index}`} className={classNames('topup-step', index === 1 && 'active')}>
              <span className="animate-pulse bg-white/10 text-transparent">0</span>
              <small className="h-3 w-20 animate-pulse rounded-full bg-white/10 text-transparent" />
            </div>
          ))}
        </div>

        <div className="mb-4 h-4 w-48 animate-pulse rounded-full bg-white/10" />

        <div className="topup-body">
          <div className="topup-main">
            <div className="topup-game-card">
              <div className="topup-game-card__image">
                <div className="h-full w-full animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.03)_8%,rgba(255,255,255,0.12)_18%,rgba(255,255,255,0.03)_33%)] bg-[length:200%_100%]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 h-3 w-24 animate-pulse rounded-full bg-white/10" />
                <div className="mb-3 h-8 w-3/4 animate-pulse rounded-full bg-white/10" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
              </div>
            </div>

            <div className="mb-4 h-5 w-40 animate-pulse rounded-full bg-white/10" />
            <PackageGridSkeleton />
          </div>

          <aside className="sticky top-24">
            <div className="gt-panel-soft rounded-lg">
              <div className="mb-4 h-5 w-40 animate-pulse rounded-full bg-white/10" />
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`field-skeleton-${index}`} className="h-12 rounded-xl bg-white/6" aria-hidden="true" />
                ))}
                <div className="h-11 rounded-xl bg-white/8" />
                <div className="h-12 rounded-xl bg-white/8" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
