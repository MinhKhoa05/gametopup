import { useEffect, useMemo, useReducer } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '@/shared/components';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { toast } from 'sonner';
import { useGamesQuery } from '@/features/games/server';
import { useGamePackagesQuery } from '@/features/packages/server';
import { useWalletBalanceQuery } from '@/features/wallet/server';
import { usePurchaseOrderMutation } from '@/features/orders/server';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import type { Game } from '@/features/games/types';
import type { TopupCheckoutDraft, TopupCheckoutResult, TopupOrderStep } from '@/features/topup/types';
import { TopupAccountStep } from '@/features/topup/components/TopupAccountStep';
import { TopupBreadcrumb, TopupPageSkeleton, TopupStepProgress } from '@/features/topup/components/TopupLayout';
import { TopupPackageStep } from '@/features/topup/components/TopupPackageStep';
import { TopupSuccessStep } from '@/features/topup/components/TopupSuccessStep';
import { routes } from '@/app/router/routes';

type TopupDraftState = {
  checkoutDraft: TopupCheckoutDraft | null;
  checkoutResult: TopupCheckoutResult | null;
  gameAccountInfo: string;
  selectedPackageId: number | null;
};

type TopupDraftAction =
  | { type: 'reset' }
  | { type: 'set-account'; value: string }
  | { type: 'set-package'; value: number | null }
  | { type: 'set-draft'; value: TopupCheckoutDraft }
  | { type: 'set-result'; value: TopupCheckoutResult };

const initialDraftState: TopupDraftState = {
  checkoutDraft: null,
  checkoutResult: null,
  gameAccountInfo: '',
  selectedPackageId: null,
};

function draftReducer(state: TopupDraftState, action: TopupDraftAction): TopupDraftState {
  switch (action.type) {
    case 'reset':
      return initialDraftState;
    case 'set-account':
      return { ...state, gameAccountInfo: action.value };
    case 'set-package':
      return { ...state, selectedPackageId: action.value };
    case 'set-draft':
      return { ...state, checkoutDraft: action.value, checkoutResult: null };
    case 'set-result':
      return { ...state, checkoutResult: action.value };
    default:
      return state;
  }
}

export function TopupPage() {
  const navigate = useNavigate();
  const { gameId: gameIdParam, step: stepParam } = useParams<{ gameId?: string; step?: string }>();
  const auth = useAuthSession();
  const gamesQuery = useGamesQuery();
  const purchaseOrderMutation = usePurchaseOrderMutation();
  const walletQuery = useWalletBalanceQuery(auth.status === 'authenticated');
  const [draftState, dispatch] = useReducer(draftReducer, initialDraftState);

  const topupGameId = Number(gameIdParam);
  const currentStepValue = Number(stepParam);
  const currentStep: TopupOrderStep = currentStepValue === 2 ? 2 : 1;
  const hasValidGameId = Number.isFinite(topupGameId) && topupGameId > 0;

  const game = useMemo(() => {
    if (!topupGameId) {
      return null;
    }

    return gamesQuery.data?.find((item) => item.id === topupGameId) ?? null;
  }, [gamesQuery.data, topupGameId]);

  const packagesQuery = useGamePackagesQuery(game?.id ?? null);
  const packages = packagesQuery.data ?? [];

  useEffect(() => {
    dispatch({ type: 'reset' });
  }, [topupGameId]);

  useEffect(() => {
    if (!game || !hasValidGameId) {
      return;
    }

    if (!stepParam) {
      navigate(routes.topup(game.id, 1), { replace: true });
    }
  }, [game, hasValidGameId, navigate, stepParam]);

  useEffect(() => {
    if (!packages.length) {
      dispatch({ type: 'set-package', value: null });
      return;
    }

    if (!draftState.selectedPackageId || !packages.some((item) => item.id === draftState.selectedPackageId)) {
      dispatch({ type: 'set-package', value: packages[0].id });
    }
  }, [draftState.selectedPackageId, packages]);

  if (gamesQuery.isPending && !game) {
    return <TopupPageSkeleton />;
  }

  if (!game) {
    return <EmptyState className="mx-auto max-w-2xl" title="Không tìm thấy game." description="Vui lòng quay lại kho game và chọn lại." />;
  }

  const selectedPackage = packages.find((item) => item.id === draftState.selectedPackageId) ?? null;
  const walletBalance = walletQuery.data ?? 0;
  const walletLoading = walletQuery.isPending && !walletQuery.data;
  const busy = purchaseOrderMutation.isPending;

  const onPurchase = () => {
    if (!selectedPackage || !draftState.gameAccountInfo.trim() || walletLoading) {
      return;
    }

    const checkoutTotal = selectedPackage.salePrice;
    const shortage = Math.max(0, checkoutTotal - walletBalance);
    if (shortage > 0) {
      return;
    }

    const confirmed = window.confirm(
      [
        `Bạn muốn mua gói "${selectedPackage.name}" với giá ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedPackage.salePrice)}?`,
        `Tài khoản nhận hàng: ${draftState.gameAccountInfo.trim()}`,
        'Đơn hàng sẽ được tạo và trừ ví ngay lập tức.',
      ].join('\n\n'),
    );

    if (!confirmed) {
      return;
    }

    dispatch({
      type: 'set-draft',
      value: {
        gameAccountInfo: draftState.gameAccountInfo.trim(),
        packageId: selectedPackage.id,
      },
    });

    void (async () => {
      try {
        const orderId = await purchaseOrderMutation.mutateAsync({
          gamePackageId: selectedPackage.id,
          gameAccountInfo: draftState.gameAccountInfo.trim(),
        });

        dispatch({
          type: 'set-result',
          value: {
            orderId,
            successAt: new Date().toISOString(),
          },
        });
        navigate(routes.topup(game.id, 2));
      } catch (error) {
        console.error(error);
        toast.error('Không thể hoàn tất mua gói. Vui lòng thử lại.');
      }
    })();
  };

  const onCreateNewOrder = () => {
    dispatch({ type: 'reset' });
    navigate(routes.topup(game.id, 1), { replace: true });
  };

  return (
    <AppPageContainer className="py-8">
      <TopupBreadcrumb gameName={game.name} />

      <div className="gt-surface p-5 sm:p-6">
        <TopupStepProgress currentStep={currentStep} />

        <button
          className="mb-4 inline-flex items-center gap-2 border-0 bg-transparent p-0 text-sm font-bold text-slate-400 hover:text-cyan-50"
          type="button"
          onClick={() => {
            if (currentStep === 1) {
              navigate(routes.games());
              return;
            }

            navigate(routes.topup(game.id, (currentStep - 1) as TopupOrderStep));
          }}
        >
          <span>←</span>
          {currentStep === 1 ? 'Quay lại danh sách game' : 'Quay lại bước trước'}
        </button>

        {currentStep === 1 && (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <TopupPackageStep
              gameImageUrl={game.imageUrl}
              gameName={game.name}
              isLoading={packagesQuery.isPending && !packagesQuery.data}
              onSelectPackage={(packageId) => dispatch({ type: 'set-package', value: packageId })}
              packages={packages}
              selectedPackageId={draftState.selectedPackageId}
            />
            <TopupAccountStep
              busy={busy}
              gameAccountInfo={draftState.gameAccountInfo}
              isAuthenticated={auth.status === 'authenticated'}
              walletBalance={walletBalance}
              walletLoading={walletLoading}
              selectedPackage={selectedPackage}
              onPurchase={onPurchase}
              onGameAccountInfoChange={(value) => dispatch({ type: 'set-account', value })}
            />
          </div>
        )}

        {currentStep === 2 && (
          <TopupSuccessStep
            checkoutDraft={draftState.checkoutDraft}
            checkoutResult={draftState.checkoutResult}
            game={game}
            packageItem={selectedPackage}
            onCreateNewOrder={onCreateNewOrder}
          />
        )}
      </div>
    </AppPageContainer>
  );
}
