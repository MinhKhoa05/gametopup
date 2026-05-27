using GameTopUp.BLL.Common;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.BLL.DTOs.Orders;

namespace GameTopUp.BLL.UseCases
{
    public class OrderUseCase
    {
        private readonly GamePackageService _packageService;
        private readonly WalletService _walletService;
        private readonly OrderService _orderService;
        private readonly DatabaseContext _database;

        public OrderUseCase(
            GamePackageService packageService,
            WalletService walletService,
            OrderService orderService,
            DatabaseContext database)
        {
            _packageService = packageService;
            _walletService = walletService;
            _orderService = orderService;
            _database = database;
        }

        public async Task<long> PlaceOrderAsync(UserContext context, PlaceOrderRequestDTO request)
        {
            // Lấy thông tin và kiểm tra tính khả dụng trong 1 lần gọi Service.
            var package = await _packageService.GetAvailablePackageAsync(request.GamePackageId, request.Quantity);

            return await _database.ExecuteInTransactionAsync(async () =>
            {
                // Trừ tồn kho ngay khi đặt hàng để đảm bảo "giữ chỗ" sản phẩm cho khách.
                await _packageService.DecreaseStockAsync(request.GamePackageId, request.Quantity);
                
                // Tạo đơn hàng cho khách.
                return await _orderService.CreateOrderAsync(context, package, request.Quantity, request.GameAccountInfo);
            });            
        }

        public async Task PayOrderAsync(long orderId, UserContext context)
        {
            await _database.ExecuteInTransactionAsync(async () =>
            {
                // WHY: Lock ở UseCase để đảm bảo quy trình (Order + Wallet) là nguyên tử.
                var order = await _orderService.GetWithLockByIdOrThrowAsync(orderId);
                _orderService.ValidateForPayment(order, context);

                // 2. Debit wallet & Mark paid
                await _walletService.PayOrderAsync(order);
                await _orderService.MarkAsPaidAsync(order, context);
            });
        }

        public async Task PickOrderAsync(long orderId, UserContext adminContext)
        {
            await _database.ExecuteInTransactionAsync(async () =>
            {
                // WHY: Lock trước khi tiếp nhận để tránh Admin khác cùng xử lý.
                var order = await _orderService.GetWithLockByIdOrThrowAsync(orderId);
                await _orderService.PickOrderAsync(order, adminContext);
            });
        }

        public async Task CompleteOrderAsync(long orderId, UserContext adminContext)
        {
            await _database.ExecuteInTransactionAsync(async () =>
            {
                var order = await _orderService.GetWithLockByIdOrThrowAsync(orderId);
                await _orderService.CompleteOrderAsync(order, adminContext);
            });
        }

        public async Task CancelOrderAsync(long orderId, UserContext userContext, string? reason = null)
        {
            await _database.ExecuteInTransactionAsync(async () =>
            {
                // WHY: Service trả về trạng thái cũ để UseCase quyết định bù trừ (Hoàn tiền/Kho).
                var order = await _orderService.GetWithLockByIdOrThrowAsync(orderId);
                var oldStatus = await _orderService.CancelOrderAsync(order, userContext, reason);
                if (oldStatus == null) return;

                // 2. Refund stock & money
                await _packageService.IncreaseStockAsync(order.GamePackageId, order.Quantity);

                if (oldStatus == OrderStatus.Paid || oldStatus == OrderStatus.Processing)
                {
                    await _walletService.RefundOrderAsync(order, reason);
                }
            });
        }
    }
}
