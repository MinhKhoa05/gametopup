using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using GameTopUp.BLL.Common;
using GameTopUp.BLL.Exceptions;

namespace GameTopUp.BLL.Services
{
    public class OrderService
    {
        private readonly IOrderRepository _orderRepo;
        private readonly IOrderHistoryRepository _orderHistoryRepo;

        public OrderService(IOrderRepository orderRepo, IOrderHistoryRepository orderHistoryRepo)
        {
            _orderRepo = orderRepo;
            _orderHistoryRepo = orderHistoryRepo;
        }
        
        public async Task<List<Order>> GetOrdersByUserAsync(UserContext context, OrderStatus? status = null)
        {
            return await _orderRepo.GetByUserIdAsync(context.UserId, status);
        }

        public async Task<List<Order>> GetAllOrdersAsync(OrderStatus? status = null)
        {
            return await _orderRepo.GetAllAsync(status);
        }

        public async Task<List<OrderHistory>> GetHistoriesAsync(long orderId)
        {
            return await _orderHistoryRepo.GetByOrderIdAsync(orderId);
        }

        public async Task<Order> GetByIdOrThrowAsync(long orderId)
        {
            return await _orderRepo.GetByIdAsync(orderId)
                ?? throw new NotFoundException($"Không tìm thấy đơn hàng #{orderId}");
        }

        public async Task<Order> GetWithLockByIdOrThrowAsync(long orderId)
        {
            // WHY: Pessimistic Lock ngăn chặn trạng thái đơn hàng bị thay đổi đồng thời.
            return await _orderRepo.GetWithLockByIdAsync(orderId)
                ?? throw new NotFoundException($"Không tìm thấy đơn hàng #{orderId}");
        }

        public async Task<long> CreateOrderAsync(UserContext context, GamePackage package, int quantity, string gameAccountInfo)
        {
            if (await _orderRepo.HasPendingOrderAsync(context.UserId))
            {
                throw new BusinessException("Bạn đang có một đơn hàng chờ thanh toán. Vui lòng hoàn tất hoặc hủy đơn hàng đó trước khi tạo đơn mới.");
            }

            var order = new Order
            {
                UserId = context.UserId,
                GamePackageId = package.Id,
                UnitPrice = package.SalePrice,
                Quantity = quantity,
                GameAccountInfo = gameAccountInfo,
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            try
            {
                var newOrderId = await _orderRepo.CreateAsync(order);
                order.Id = newOrderId;

                // Save history
                await _orderHistoryRepo.CreateAsync(new OrderHistory
                {
                    OrderId = newOrderId,
                    FromStatus = order.Status,
                    ToStatus = order.Status,
                    Note = "Đơn hàng được tạo (Chờ thanh toán).",
                    ActionBy = context.UserId,
                    IsAdmin = false,
                    CreatedAt = DateTime.UtcNow
                });

                return newOrderId;
            }
            catch (Exception ex) when (ex.Message.Contains("Duplicate", StringComparison.OrdinalIgnoreCase) || 
                                       ex.Message.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase))
            {
                throw new BusinessException("Bạn đang có một đơn hàng đang chờ thanh toán. Vui lòng thực hiện thanh toán hoặc hủy đơn hàng đó trước khi tạo đơn mới.");
            }
        }

        public async Task PickOrderAsync(Order order, UserContext admin)
        {
            // WHY: Đảm bảo tính Idempotent cho phép Admin retry nếu mạng lỗi.
            if (order.Status == OrderStatus.Processing && order.AssignTo == admin.UserId)
                return;

            if (order.Status == OrderStatus.Processing)
                throw new BusinessException("Đơn hàng đã được admin khác tiếp nhận.");

            if (order.Status != OrderStatus.Paid)
                throw new BusinessException("Chỉ có thể tiếp nhận đơn hàng đã thanh toán.");

            var fromStatus = order.Status;

            order.Status = OrderStatus.Processing;
            order.AssignTo = admin.UserId;
            order.AssignAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;

            await _orderRepo.UpdateAsync(order);

            // Save history
            await _orderHistoryRepo.CreateAsync(new OrderHistory
            {
                OrderId = order.Id,
                FromStatus = fromStatus,
                ToStatus = OrderStatus.Processing,
                Note = $"Admin {admin.Username} tiếp nhận đơn hàng.",
                ActionBy = admin.UserId,
                IsAdmin = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        public async Task CompleteOrderAsync(Order order, UserContext admin)
        {
            // WHY: Cho phép Admin retry an toàn khi mạng chập chờn.
            if (order.Status == OrderStatus.Completed)
                return;

            if (order.Status != OrderStatus.Processing)
                throw new BusinessException("Trạng thái đơn hàng không hợp lệ để hoàn thành.");

            if (order.AssignTo != admin.UserId)
                throw new BusinessException("Bạn không thể can thiệp vào đơn hàng của người khác.");

            var fromStatus = order.Status;

            order.Status = OrderStatus.Completed;
            order.UpdatedAt = DateTime.UtcNow;

            await _orderRepo.UpdateAsync(order);

            // Save history
            await _orderHistoryRepo.CreateAsync(new OrderHistory
            {
                OrderId = order.Id,
                FromStatus = fromStatus,
                ToStatus = OrderStatus.Completed,
                Note = $"Admin {admin.Username} xác nhận hoàn thành.",
                ActionBy = admin.UserId,
                IsAdmin = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        public async Task<OrderStatus?> CancelOrderAsync(Order order, UserContext user, string? reason = null)
        {
            // WHY: Trả về null nếu đơn đã hủy trước đó (Idempotency).
            if (order.Status == OrderStatus.Cancelled) return null;

            if (order.Status == OrderStatus.Completed)
                throw new BusinessException("Đơn hàng đã hoàn thành không thể hủy.");

            bool isOwner = order.UserId == user.UserId;
            bool isAssignedAdmin = order.AssignTo == user.UserId;

            if (!isOwner && !isAssignedAdmin)
                throw new ForbiddenException("Bạn không thể can thiệp vào đơn hàng của người khác.");
            
            if (order.Status == OrderStatus.Processing && order.UserId == user.UserId)
                throw new ForbiddenException("Đơn hàng đang được xử lý, không thể hủy.");

            var oldStatus = order.Status;

            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            await _orderRepo.UpdateAsync(order);

            // Save history
            var note = $"Hủy đơn hàng." + (string.IsNullOrEmpty(reason) ? "" : $" Lý do: {reason}");
            await _orderHistoryRepo.CreateAsync(new OrderHistory
            {
                OrderId = order.Id,
                FromStatus = oldStatus,
                ToStatus = OrderStatus.Cancelled,
                Note = note,
                ActionBy = user.UserId,
                CreatedAt = DateTime.UtcNow
            });

            return oldStatus;
        }

        public void ValidateForPayment(Order order, UserContext user)
        {
            if (order.UserId != user.UserId) 
                throw new BusinessException("Bạn không có quyền thanh toán đơn hàng này.");
                
            if (order.Status != OrderStatus.Pending) 
                throw new BusinessException("Đơn hàng không ở trạng thái chờ thanh toán.");
        }

        public async Task MarkAsPaidAsync(Order order, UserContext user)
        {
            var fromStatus = order.Status; 
            order.Status = OrderStatus.Paid; 
            order.UpdatedAt = DateTime.UtcNow;
            
            await _orderRepo.UpdateAsync(order);

            // Save history
            await _orderHistoryRepo.CreateAsync(new OrderHistory
            {
                OrderId = order.Id,
                FromStatus = fromStatus, 
                ToStatus = order.Status,
                Note = "Thanh toán đơn hàng thành công.",
                ActionBy = user.UserId,
                IsAdmin = false,
                CreatedAt = DateTime.UtcNow
            });
        }
    }
}
