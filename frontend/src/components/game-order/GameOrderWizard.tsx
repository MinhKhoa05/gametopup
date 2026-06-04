import { useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Home } from 'lucide-react';
import { useAuthUserQuery } from '../../services/auth';
import { useWalletQuery } from '../../services/wallet';
import { EmptyState } from '../ui/EmptyState';
import { classNames } from '../../lib/ui';
import type { Route } from '../../lib/routes';
import { GameOrderPackageStep, PackageGridSkeleton } from './GameOrderPackageStep';
import { GameOrderReviewStep } from './GameOrderReviewStep';
import { GameOrderSuccessStep } from './GameOrderSuccessStep';
import { useGameOrderGame, useGameOrderPackages } from '../../hooks/game-order.hooks';
import { useGameOrderStore } from '../../store/game-order.store';

type Props = {
  gameId: number;
  navigate: (route: Route) => void;
};

export function GameOrderWizard({ gameId, navigate }: Props) {
  const gameQuery = useGameOrderGame(gameId);
  const packagesQuery = useGameOrderPackages(gameId);
  const authQuery = useAuthUserQuery();
  const user = authQuery.data ?? null;
  const walletQuery = useWalletQuery(Boolean(user));
  const wallet = walletQuery.data ?? null;
  const step = useGameOrderStore((state) => state.step);
  const activeGameId = useGameOrderStore((state) => state.activeGameId);
  const selectedPackageId = useGameOrderStore((state) => state.selectedPackageId);
  const setActiveGameId = useGameOrderStore((state) => state.setActiveGameId);
  const setSelectedPackageId = useGameOrderStore((state) => state.setSelectedPackageId);
  const setStep = useGameOrderStore((state) => state.setStep);
  const resetWizard = useGameOrderStore((state) => state.resetWizard);

  const game = gameQuery.isPlaceholderData ? null : gameQuery.data ?? null;
  const packages = packagesQuery.isPlaceholderData ? [] : packagesQuery.data ?? [];
  const previousStepRef = useRef(step);
  const stepDirection = step >= previousStepRef.current ? 'forward' : 'back';

  useEffect(() => {
    if (activeGameId !== gameId) {
      resetWizard();
      setActiveGameId(gameId);
    }
  }, [activeGameId, gameId, resetWizard, setActiveGameId]);

  useEffect(() => {
    previousStepRef.current = step;
  }, [step]);

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
    <div className="mx-auto max-w-[1120px]">
      <GameOrderHeader gameName={game.name} />

      <div className="gametopup-surface p-[22px] max-[760px]:p-4">
        <GameOrderProgress step={step} direction={stepDirection} />
        <GameOrderBackButton step={step} navigate={navigate} onBack={() => setStep((step - 1) as 1 | 2 | 3)} />

        <div key={step} className={classNames('game-order-stage', stepDirection === 'back' && 'game-order-stage--back')}>
          {step === 1 && <GameOrderPackageStep game={game} packages={packages} isLoading={packagesQuery.isPending && !packagesQuery.data} user={user} />}
          {step === 2 && (
            <GameOrderReviewStep
              game={game}
              user={user}
              wallet={wallet}
              walletLoading={walletQuery.isPending && !walletQuery.data}
              navigate={navigate}
            />
          )}
          {step === 3 && <GameOrderSuccessStep />}
        </div>
      </div>
    </div>
  );
}

function GameOrderHeader({ gameName }: { gameName: string }) {
  return (
    <div className="mb-5 flex items-center gap-2 text-sm text-slate-400">
      <Home size={16} />
      <span>Đơn hàng</span>
      <ChevronRight size={14} />
      <span className="font-bold text-white">{gameName}</span>
    </div>
  );
}

function GameOrderBackButton({
  step,
  navigate,
  onBack,
}: {
  step: 1 | 2 | 3;
  navigate: (route: Route) => void;
  onBack: () => void;
}) {
  const isFirstStep = step === 1;

  return (
    <button
      className="mb-4 inline-flex items-center gap-2 border-0 bg-transparent p-0 text-[0.84rem] font-bold text-slate-400 hover:text-cyan-50"
      type="button"
      onClick={() => {
        if (isFirstStep) {
          navigate({ name: 'games' });
          return;
        }

        onBack();
      }}
    >
      <ArrowLeft size={15} />
      {isFirstStep ? 'Quay lại danh sách game' : 'Quay lại bước trước'}
    </button>
  );
}

export function GameOrderProgress({ step, direction }: { step: 1 | 2 | 3; direction?: 'forward' | 'back' }) {
  return (
    <div
      key={step}
      className={classNames(
        'topup-steps',
        step === 3 && 'topup-steps--success',
        direction === 'back' ? 'topup-steps--back' : 'topup-steps--forward',
      )}
      aria-label="Tiến trình đặt hàng"
    >
      {['Chọn gói & nhập thông tin', 'Thanh toán', 'Đặt hàng thành công'].map((label, index) => {
        const stepNumber = (index + 1) as 1 | 2 | 3;
        const isActive = step === stepNumber;
        const isCompleted = step > stepNumber;

        return (
          <div key={label} className={classNames('topup-step', isCompleted && 'completed', isActive && 'active')}>
            <span>{isCompleted ? <CheckCircle2 size={14} /> : stepNumber}</span>
            <small>{label}</small>
          </div>
        );
      })}
    </div>
  );
}

export function GameOrderSkeleton() {
  return (
    <div className="mx-auto max-w-[1120px]" aria-busy="true" aria-label="Đang tải trang đặt hàng">
      <div className="mb-5 flex items-center gap-2 text-sm text-slate-400">
        <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-36 animate-pulse rounded-full bg-white/10" />
      </div>

      <div className="gametopup-surface p-[22px] max-[760px]:p-4">
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
            <div className="gametopup-surface rounded-[8px] border-cyanline/16">
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
