import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { routes } from '@/app/router/routes';
import { useAuthUserQuery } from '@/features/auth/server';
import { usePurchaseFlow } from '../usePurchaseFlow';
import { useGamesQuery } from '@/features/games/server';
import { PackageDetailPanel } from '@/features/packages/components/PackageDetailPanel';
import { PackageGrid } from '@/features/packages/components/PackageGrid';
import { PurchasePackageDialog } from '@/features/packages/components/PurchasePackageDialog';
import { PurchaseSuccessDialog } from '@/features/packages/components/PurchaseSuccessDialog';
import { usePackagesQuery } from '@/features/packages/server';
import { useWalletBalanceQuery } from '@/features/wallet/server';
import { Container, EmptyState, ImageBox, LoadingState, PageHero } from '@/shared/components';
import { useAutoSelectId } from '@/shared/hooks/useAutoSelectId';

export function GamePackagePage() {
  const navigate = useNavigate();
  const { gameId: gameIdParam } = useParams<{ gameId?: string }>();
  const userQuery = useAuthUserQuery();
  const isAuthenticated = userQuery.data !== null && userQuery.data !== undefined;
  const gamesQuery = useGamesQuery();

  const gameId = Number(gameIdParam ?? 0);
  const game = gamesQuery.data?.find((item) => item.id === gameId);
  const packagesQuery = usePackagesQuery(game?.id ?? null);
  const packages = packagesQuery.data ?? [];
  const isInitialGamesLoading = gamesQuery.isPending && gamesQuery.data === undefined;
  const isInitialPackagesLoading = packagesQuery.isPending && packagesQuery.data === undefined;
  const [selectedPackageId, setSelectedPackageId] = useAutoSelectId(packages, game?.id ?? null);
  const walletQuery = useWalletBalanceQuery(isAuthenticated);
  const walletBalance = walletQuery.data ?? 0;
  const selectedPackage = packages.find((item) => item.id === selectedPackageId);

  const purchase = usePurchaseFlow({
    gameId,
    selectedPackage,
    onContinueShopping: () => setSelectedPackageId(null),
  });

  useEffect(() => {
    purchase.closeConfirm();
    purchase.closeSuccess();
  }, [gameId]);

  if (isInitialGamesLoading && !game) {
    return (
      <Container className="py-5 sm:py-7 lg:py-8">
        <LoadingState title="Dang tai trang dat hang..." />
      </Container>
    );
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
          <PackageGrid
            isLoading={isInitialPackagesLoading}
            onSelectPackage={setSelectedPackageId}
            packages={packages}
            selectedPackageId={selectedPackageId}
          />

          <PackageDetailPanel gameName={game.name} onPurchase={handleRequestPurchase} selectedPackage={selectedPackage ?? null} />
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
