import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { routes } from '@/app/router/routes';
import { useAuthUserQuery } from '@/features/auth/server';
import { GamePackagePageSkeleton } from '@/features/packages/components/PackagePageSkeleton';
import { usePurchaseFlow } from '../usePurchaseFlow';
import { useGamesQuery } from '@/features/games/server';
import { GamePackageDetailPanel } from '@/features/packages/components/PackageDetailPanel';
import { GamePackageGrid } from '@/features/packages/components/PackageGrid';
import { PurchasePackageDialog } from '@/features/packages/components/PurchasePackageDialog';
import { PurchaseSuccessDialog } from '@/features/packages/components/PurchaseSuccessDialog';
import { usePackagesQuery } from '@/features/packages/server';
import { useWalletBalanceQuery } from '@/features/wallet/server';
import { Container, EmptyState, ImageBox, PageHero } from '@/shared/components';

export function GamePackagePage() {
  const navigate = useNavigate();
  const { gameId: gameIdParam } = useParams<{ gameId?: string }>();
  const userQuery = useAuthUserQuery();
  const isAuthenticated = userQuery.data !== null && userQuery.data !== undefined;
  const gamesQuery = useGamesQuery();
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);

  const gameId = Number(gameIdParam ?? 0);
  const game = gamesQuery.data?.find((item) => item.id === gameId);
  const packagesQuery = usePackagesQuery(game?.id ?? null);
  const packages = packagesQuery.data ?? [];
  const walletQuery = useWalletBalanceQuery(isAuthenticated);
  const walletBalance = walletQuery.data ?? 0;
  const selectedPackage = packages.find((item) => item.id === selectedPackageId);

  const purchase = usePurchaseFlow({
    gameId,
    selectedPackage,
    onContinueShopping: () => setSelectedPackageId(null),
  });

  useEffect(() => {
    setSelectedPackageId(null);
    purchase.closeConfirm();
    purchase.closeSuccess();
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
    return <GamePackagePageSkeleton />;
  }

  if (!game) {
    return <EmptyState className="mx-auto max-w-2xl" title="Không tìm thấy game." description="Vui lòng quay lại kho game và chọn lại." />;
  }

  const handleRequestPurchase = () => {
    if (
      !isAuthenticated ||
      !selectedPackage ||
      walletQuery.isPending ||
      selectedPackage.salePrice > walletBalance
    ) {
      return;
    }

    purchase.openConfirm();
  };

  return (
    <Container className="py-5 sm:py-7 lg:py-8">
      <div className="grid gap-10 lg:gap-12">
        <PageHero
          onClick={() => navigate(routes.games())}
          visual={
            <div className="h-[72px] w-[72px] overflow-hidden rounded-[22px] border border-[color:var(--gt-border)] bg-[var(--gt-panel-soft)] shadow-[0_10px_24px_rgba(2,6,23,0.18)] sm:h-[88px] sm:w-[88px]">
              <ImageBox src={game.imageUrl} alt={game.name} className="h-full w-full object-cover" />
            </div>
          }
          title={game.name}
          description="Chọn gói nạp phù hợp và tạo đơn hàng."
        />

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,6.9fr)_minmax(0,3.1fr)] lg:gap-8">
          <GamePackageGrid
            isLoading={packagesQuery.isPending}
            onSelectPackage={setSelectedPackageId}
            packages={packages}
            selectedPackageId={selectedPackageId}
          />

          <GamePackageDetailPanel gameName={game.name} onPurchase={handleRequestPurchase} selectedPackage={selectedPackage ?? null} />
        </div>
      </div>

      {selectedPackage ? (
        <PurchasePackageDialog
          game={game}
          isOpen={purchase.dialogOpen}
          loading={purchase.loading}
          onClose={purchase.closeConfirm}
          onConfirm={purchase.confirmPurchase}
          selectedPackage={selectedPackage}
          walletBalance={walletBalance}
        />
      ) : null}

      {purchase.checkoutResult && selectedPackage ? (
        <PurchaseSuccessDialog
          game={game}
          isOpen={purchase.successOpen}
          onContinue={purchase.continueShopping}
          onViewOrders={() => navigate(routes.orders())}
          packageItem={selectedPackage}
          purchaseInfo={purchase.purchaseInfo ?? { characterName: '', uidServer: '' }}
          result={purchase.checkoutResult}
        />
      ) : null}
    </Container>
  );
}
