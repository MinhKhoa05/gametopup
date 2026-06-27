import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Container } from '@/shared/components';
import { SiteCredits } from '@/app/components';
import { routes } from '@/app/router/routes';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useGamesQuery } from '@/features/games/server';
import { useGamePackagesQuery } from '@/features/packages/server';
import { useCreateOrderMutation } from '@/features/orders/server';
import { useWalletBalanceQuery } from '@/features/wallet/server';
import { EmptyState, ImageBox, PageHero } from '@/shared/components';
import { GameDetailPageSkeleton } from '@/features/games/components/GameDetailLayout';
import { GamePackageDetailPanel } from '@/features/packages/components/GamePackageDetailPanel';
import { GamePackageGrid } from '@/features/packages/components/GamePackageGrid';
import { PurchasePackageDialog } from '@/features/packages/components/PurchasePackageDialog';
import { PurchaseSuccessDialog } from '@/features/packages/components/PurchaseSuccessDialog';

type GameDetailCheckoutResult = {
  orderId: number;
  successAt: string;
};

type GameDetailPurchaseInfo = {
  characterName: string;
  uidServer: string;
};

export function GameDetailPage() {
  const navigate = useNavigate();
  const { gameId: gameIdParam } = useParams<{ gameId?: string }>();
  const { isAuthenticated } = useAuthSession();
  const gamesQuery = useGamesQuery();
  const createOrderMutation = useCreateOrderMutation();
  const walletQuery = useWalletBalanceQuery(isAuthenticated);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isSuccessOpen, setSuccessOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<GameDetailCheckoutResult | null>(null);
  const [purchaseInfo, setPurchaseInfo] = useState<GameDetailPurchaseInfo | null>(null);

  const gameId = Number(gameIdParam);

  const game = gameId ? gamesQuery.data?.find((item) => item.id === gameId) ?? null : null;

  const packagesQuery = useGamePackagesQuery(game?.id ?? null);
  const packages = packagesQuery.data ?? [];

  useEffect(() => {
    setSelectedPackageId(null);
    setConfirmOpen(false);
    setSuccessOpen(false);
    setCheckoutResult(null);
    setPurchaseInfo(null);
  }, [gameId]);

  useEffect(() => {
    if (!packages.length) {
      setSelectedPackageId(null);
      return;
    }

    if (!selectedPackageId || !packages.some((item) => item.id === selectedPackageId)) {
      setSelectedPackageId(packages[0].id);
    }
  }, [selectedPackageId, packages]);

  if (gamesQuery.isPending && !game) {
    return <GameDetailPageSkeleton />;
  }

  if (!game) {
    return <EmptyState className="mx-auto max-w-2xl" title="Không tìm thấy game." description="Vui lòng quay lại kho game và chọn lại." />;
  }

  const selectedPackage = packages.find((item) => item.id === selectedPackageId) ?? null;
  const walletBalance = walletQuery.data ?? 0;
  const walletLoading = walletQuery.isPending && !walletQuery.data;
  const orderLoading = createOrderMutation.isPending;
  const canRequestPurchase = !!selectedPackage && !walletLoading && isAuthenticated && selectedPackage.salePrice <= walletBalance;

  const handleRequestPurchase = () => {
    if (!isAuthenticated) {
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

    const characterName = draft.characterName.trim();
    const uidServer = draft.uidServer.trim();

    setPurchaseInfo({
      characterName,
      uidServer,
    });

    const gameAccountInfo = characterName
      ? `${uidServer} | Nhân vật: ${characterName}`
      : uidServer;

    void (async () => {
      try {
        const orderId = await createOrderMutation.mutateAsync({
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
    setSelectedPackageId(null);
  };

  return (
    <Container className="py-5 sm:py-7 lg:py-8">
      <div className="grid gap-10 lg:gap-12">
        <button
          type="button"
          className="group rounded-[24px] text-left transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gt-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gt-bg)]"
          onClick={() => navigate(routes.games())}
        >
          <PageHero
            eyebrow="NẠP GAME"
            visual={
              <div className="h-[72px] w-[72px] overflow-hidden rounded-[22px] border border-[color:var(--gt-border)] bg-[var(--gt-panel-soft)] shadow-[0_10px_24px_rgba(2,6,23,0.18)] transition-transform duration-200 group-hover:scale-[1.02] sm:h-[88px] sm:w-[88px]">
                <ImageBox
                  src={game.imageUrl}
                  alt={game.name}
                  className="h-full w-full object-cover"
                />
              </div>
            }
            title={game.name}
            description="Chọn gói nạp phù hợp và tạo đơn hàng."
          />
        </button>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,6.9fr)_minmax(0,3.1fr)] lg:gap-8">
          <GamePackageGrid
            isLoading={packagesQuery.isPending && !packagesQuery.data}
            onSelectPackage={setSelectedPackageId}
            packages={packages}
            selectedPackageId={selectedPackageId}
          />

          <GamePackageDetailPanel gameName={game.name} onPurchase={handleRequestPurchase} selectedPackage={selectedPackage} />
        </div>

        <div className="mt-16 sm:mt-20">
          <SiteCredits />
        </div>
      </div>

      {selectedPackage ? (
        <PurchasePackageDialog
          game={game}
          isOpen={isConfirmOpen}
          loading={orderLoading}
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
    </Container>
  );
}
