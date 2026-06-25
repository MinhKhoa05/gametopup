import { Container, IconBox, PageHero } from '@/shared/components';
import { ClipboardList } from 'lucide-react';
import { useOrdersPage } from '@/features/orders/hooks/useOrdersPage';
import { OrdersPageView } from '@/features/orders/components/OrdersPageView';

export function OrdersPage() {
  const ordersPage = useOrdersPage();

  return (
    <div className="relative isolate overflow-hidden">
      <Container className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-6 lg:gap-7">
          <PageHero
            eyebrow="LỊCH SỬ ĐƠN HÀNG"
            visual={
              <IconBox size="lg" tone="primary" className="h-[62px] w-[62px] rounded-[18px]">
                <ClipboardList size={30} strokeWidth={1.8} />
              </IconBox>
            }
            title="Lịch sử đơn hàng"
            description="Theo dõi trạng thái và lịch sử các đơn nạp game của bạn."
          />

          <OrdersPageView {...ordersPage} />
        </div>
      </Container>
    </div>
  );
}
