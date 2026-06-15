import { useEffect, useMemo, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { SiteCredits } from '@/app/site-shell/SiteCredits';
import { routes } from '@/app/router/routes';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useGamesQuery } from '@/features/games/server';
import { useGamePackagesQuery } from '@/features/packages/server';
import { usePurchaseOrderMutation } from '@/features/orders/server';
import { useWalletBalanceQuery } from '@/features/wallet/server';
import { EmptyState, ImageBox, PageHero } from '@/shared/components';
import { GameDetailPageSkeleton } from '@/features/games/components/GameDetailLayout';
import { GamePackageDetailPanel } from '@/features/games/components/GamePackageDetailPanel';
import { GamePackageGrid } from '@/features/games/components/GamePackageGrid';
import { PackagePurchaseDialog, PurchaseSuccessDialog } from '@/features/games/components/PurchasePackageDialog';

type GameDetailDraftState = {
  selectedPackageId: number | null;
};

type GameDetailDraftAction =
  | { type: 'reset' }
  | { type: 'set-package'; value: number | null };

type GameDetailCheckoutResult = {
  orderId: number;
  successAt: string;
};

type GameDetailPurchaseInfo = {
  characterName: string;
  uidServer: string;
};

const initialDraftState: GameDetailDraftState = {
  selectedPackageId: null,
};

function draftReducer(state: GameDetailDraftState, action: GameDetailDraftAction): GameDetailDraftState {
  switch (action.type) {
    case 'reset':
      return initialDraftState;
    case 'set-package':
      return { ...state, selectedPackageId: action.value };
    default:
      return state;
  }
}

export function GameDetailPage() {
  const navigate = useNavigate();
  const { gameId: gameIdParam } = useParams<{ gameId?: string }>();
  const auth = useAuthSession();
  const gamesQuery = useGamesQuery();
  const purchaseOrderMutation = usePurchaseOrderMutation();
  const walletQuery = useWalletBalanceQuery(auth.status === 'authenticated');
  const [draftState, dispatch] = useReducer(draftReducer, initialDraftState);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isSuccessOpen, setSuccessOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<GameDetailCheckoutResult | null>(null);
  const [purchaseInfo, setPurchaseInfo] = useState<GameDetailPurchaseInfo | null>(null);

  const gameId = Number(gameIdParam);

  const game = useMemo(() => {
    if (!gameId) {
      return null;
    }

    return gamesQuery.data?.find((item) => item.id === gameId) ?? null;
  }, [gameId, gamesQuery.data]);

  const packagesQuery = useGamePackagesQuery(game?.id ?? null);
  const packages = packagesQuery.data ?? [];

  useEffect(() => {
    dispatch({ type: 'reset' });
    setConfirmOpen(false);
    setSuccessOpen(false);
    setCheckoutResult(null);
    setPurchaseInfo(null);
  }, [gameId]);

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
    return <GameDetailPageSkeleton />;
  }

  if (!game) {
    return <EmptyState className="mx-auto max-w-2xl" title="Không tìm thấy game." description="Vui lòng quay lại kho game và chọn lại." />;
  }

  const selectedPackage = packages.find((item) => item.id === draftState.selectedPackageId) ?? null;
  const walletBalance = walletQuery.data ?? 0;
  const walletLoading = walletQuery.isPending && !walletQuery.data;
  const busy = purchaseOrderMutation.isPending;
  const canRequestPurchase = !!selectedPackage && !walletLoading && auth.status === 'authenticated' && selectedPackage.salePrice <= walletBalance;

  const handleRequestPurchase = () => {
    if (auth.status !== 'authenticated') {
      toast.error('Vui lòng đăng nhập để đặt đơn.');
      return;
    }

    if (!selectedPackage) {
      return;
    }

    if (selectedPackage.salePrice > walletBalance) {
      toast.error('Ví không đủ số dư để mua gói này.');
      return;
    }

    if (!canRequestPurchase) {
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmPurchase = (draft: { characterName: string; uidServer: string }) => {
    if (!selectedPackage) {
      return;
    }

    setPurchaseInfo({
      characterName: draft.characterName.trim(),
      uidServer: draft.uidServer.trim(),
    });

    const gameAccountInfo = draft.characterName.trim()
      ? `${draft.uidServer.trim()} | Nhân vật: ${draft.characterName.trim()}`
      : draft.uidServer.trim();

    void (async () => {
      try {
        const orderId = await purchaseOrderMutation.mutateAsync({
          gamePackageId: selectedPackage.id,
          gameAccountInfo,
        });

        setCheckoutResult({
          orderId,
          successAt: new Date().toISOString(),
        });
        setConfirmOpen(false);
        setSuccessOpen(true);
        toast.success('Đơn hàng đã được tạo thành công.');
      } catch (error) {
        console.error(error);
        toast.error('Không thể hoàn tất mua gói. Vui lòng thử lại.');
      }
    })();
  };

  const handleContinueTopup = () => {
    setSuccessOpen(false);
    setCheckoutResult(null);
    setPurchaseInfo(null);
    dispatch({ type: 'reset' });
  };

  return (
    <AppPageContainer className="py-5 sm:py-7 lg:py-8">
      <div className="grid gap-6">
        <PageHero
          eyebrow="NẠP GAME"
          visual={
            <div className="h-[72px] w-[72px] overflow-hidden rounded-[22px] border border-cyan-400/18 bg-white/[0.03] p-1.5 sm:h-[88px] sm:w-[88px]">
              <ImageBox src={game.imageUrl} alt={game.name} className="h-full w-full rounded-[16px] object-cover" />
            </div>
          }
          title={game.name}
          description="Chọn gói nạp phù hợp và tạo đơn hàng chỉ trong vài bước."
        />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          <GamePackageGrid
            isLoading={packagesQuery.isPending && !packagesQuery.data}
            onSelectPackage={(packageId) => dispatch({ type: 'set-package', value: packageId })}
            packages={packages}
            selectedPackageId={draftState.selectedPackageId}
          />

          <GamePackageDetailPanel gameName={game.name} onPurchase={handleRequestPurchase} selectedPackage={selectedPackage} />
        </div>

        <SiteCredits />
      </div>

      {selectedPackage ? (
        <PackagePurchaseDialog
          busy={busy}
          game={game}
          isOpen={isConfirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmPurchase}
          selectedPackage={selectedPackage}
          walletBalance={walletBalance}
        />
      ) : null}

      {checkoutResult && selectedPackage ? (
        <PurchaseSuccessDialog
          game={game}
          isOpen={isSuccessOpen}
          onContinue={handleContinueTopup}
          onViewOrders={() => navigate(routes.orders())}
          packageItem={selectedPackage}
          purchaseInfo={purchaseInfo ?? { characterName: '', uidServer: '' }}
          result={checkoutResult}
        />
      ) : null}
    </AppPageContainer>
  );
}
