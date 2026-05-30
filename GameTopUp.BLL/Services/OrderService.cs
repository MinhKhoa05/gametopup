using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces.Orders;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Orders;
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
        
        public Task<List<Order>> GetOrdersByUserAsync(UserContext context, OrderStatus? status = null) =>
            _orderRepo.GetByUserIdAsync(context.UserId, status);

        public Task<List<Order>> GetAllOrdersAsync(OrderStatus? status = null) =>
            _orderRepo.GetAllAsync(status);

        public Task<List<OrderHistory>> GetHistoriesAsync(long orderId) =>
            _orderHistoryRepo.GetByOrderIdAsync(orderId);

        public async Task<Order> GetByIdOrThrowAsync(long orderId, bool withLock = false)
        {
            var order = withLock
                ? await _orderRepo.GetWithLockByIdAsync(orderId)
                : await _orderRepo.GetByIdAsync(orderId);

            return order
                ?? throw new NotFoundException(ErrorCodes.OrderNotFound, $"Không tìm thấy đơn hàng #{orderId}");
        }

        public Task<Order> GetWithLockByIdOrThrowAsync(long orderId) =>
            GetByIdOrThrowAsync(orderId, withLock: true);

        public async Task<long> CreateOrderAsync(UserContext context, GamePackage package, int quantity, string gameAccountInfo)
        {
            if (await _orderRepo.HasPendingOrderAsync(context.UserId))
            {
                throw new BusinessException(ErrorCodes.PendingOrderExists);
            }

            var order = Order.Create(context.UserId, package.Id, package.SalePrice, quantity, gameAccountInfo);

            try
            {
                var newOrderId = await _orderRepo.CreateAsync(order);
                order.Id = newOrderId;

                var history = OrderHistory.Create(
                    newOrderId,
                    order.Status,
                    order.Status,
                    context.UserId,
                    "Đơn hàng được tạo (Chờ thanh toán).");

                await _orderHistoryRepo.CreateAsync(history);

                return newOrderId;
            }
            catch (Exception ex) when (IsDuplicateError(ex))
            {
                throw new BusinessException(ErrorCodes.PendingOrderExists);
            }
        }

        public async Task<OrderChangeResult> PickOrderAsync(Order order, UserContext admin)
        {
            if (order.Status == OrderStatus.Processing && order.AssignedTo == admin.UserId)
                return OrderChangeResult.Unchanged(order);

            if (order.Status == OrderStatus.Processing)
                throw new BusinessException(ErrorCodes.OrderAlreadyAssigned);

            var fromStatus = order.Status;
            ValidateTransition(fromStatus, OrderStatus.Processing);

            order.UpdateStatus(OrderStatus.Processing, admin.UserId);

            await SaveOrderChangeAsync(
                order,
                fromStatus,
                $"Admin {admin.Username} tiếp nhận đơn hàng.",
                admin);

            return OrderChangeResult.ChangedStatus(order, fromStatus);
        }

        public async Task<OrderChangeResult> CompleteOrderAsync(Order order, UserContext admin)
        {
            if (order.Status == OrderStatus.Completed)
                return OrderChangeResult.Unchanged(order);

            ValidateTransition(order.Status, OrderStatus.Completed);

            if (order.AssignedTo != admin.UserId)
                throw new BusinessException(ErrorCodes.CannotModifyOthersOrder);

            return await UpdateStatusAsync(
                order,
                OrderStatus.Completed,
                $"Admin {admin.Username} xác nhận hoàn thành.",
                admin);
        }

        public async Task<OrderChangeResult> CancelOrderAsync(Order order, UserContext user, string? reason = null)
        {
            if (order.Status == OrderStatus.Cancelled)
                return OrderChangeResult.Unchanged(order);

            if (order.Status == OrderStatus.Completed)
                throw new BusinessException(ErrorCodes.CompletedOrderCannotBeCancelled);

            var isOwner = order.UserId == user.UserId;
            var isAssignedAdmin = order.AssignedTo == user.UserId;

            if (!isOwner && !isAssignedAdmin)
                throw new ForbiddenException(ErrorCodes.CannotModifyOthersOrder);

            if (order.Status == OrderStatus.Processing && isOwner)
                throw new ForbiddenException(ErrorCodes.ProcessingOrderCannotBeCancelled);

            return await UpdateStatusAsync(
                order,
                OrderStatus.Cancelled,
                BuildCancelNote(reason),
                user);
        }

        public void ValidateForPayment(Order order, UserContext user)
        {
            if (order.UserId != user.UserId)
                throw new BusinessException(ErrorCodes.PaymentForbidden);

            if (!ValidateTransition(order.Status, OrderStatus.Paid))
                throw new BusinessException(ErrorCodes.OrderNotPendingPayment);
        }

        public async Task<OrderChangeResult> MarkAsPaidAsync(Order order, UserContext user)
        {
            if (order.UserId != user.UserId)
                throw new BusinessException(ErrorCodes.PaymentForbidden);

            return await UpdateStatusAsync(
                order,
                OrderStatus.Paid,
                "Thanh toán đơn hàng thành công.",
                user);
        }

        private async Task<OrderChangeResult> UpdateStatusAsync(
            Order order,
            OrderStatus toStatus,
            string note,
            UserContext actor)
        {
            var fromStatus = order.Status;

            if (!ValidateTransition(fromStatus, toStatus))
                return OrderChangeResult.Unchanged(order);

            order.UpdateStatus(toStatus);

            await SaveOrderChangeAsync(order, fromStatus, note, actor);

            return OrderChangeResult.ChangedStatus(order, fromStatus);
        }

        private async Task SaveOrderChangeAsync(
            Order orderUpdated,
            OrderStatus fromStatus,
            string note,
            UserContext actor)
        {
            await _orderRepo.UpdateAsync(orderUpdated);

            // Log lịch sử thay đổi trạng thái
            var history = OrderHistory.Create(orderUpdated.Id,
                fromStatus,
                orderUpdated.Status,
                actor.UserId,
                note,
                actor.Role == UserRole.Admin);

            await _orderHistoryRepo.CreateAsync(history);
        }

        private static bool ValidateTransition(OrderStatus fromStatus, OrderStatus toStatus)
        {
            if (fromStatus == toStatus)
                return false;

            var canTransition = toStatus switch
            {
                OrderStatus.Paid => fromStatus == OrderStatus.Pending,
                OrderStatus.Processing => fromStatus == OrderStatus.Paid,
                OrderStatus.Completed => fromStatus == OrderStatus.Processing,
                OrderStatus.Cancelled => fromStatus != OrderStatus.Completed,
                _ => false
            };

            if (canTransition)
                return true;

            throw new BusinessException(GetTransitionError(toStatus));
        }

        private static string GetTransitionError(OrderStatus toStatus)
        {
            return toStatus switch
            {
                OrderStatus.Paid => ErrorCodes.OrderNotPendingPayment,
                OrderStatus.Processing => ErrorCodes.OrderMustBePaidToPick,
                OrderStatus.Completed => ErrorCodes.OrderStatusInvalidToComplete,
                OrderStatus.Cancelled => ErrorCodes.CompletedOrderCannotBeCancelled,
                _ => ErrorCodes.BadRequest
            };
        }

        private static string BuildCancelNote(string? reason)
        {
            return "Hủy đơn hàng." +
                   (string.IsNullOrEmpty(reason) ? "" : $" L\u00FD do: {reason}");
        }

        private static bool IsDuplicateError(Exception ex)
        {
            return ex.Message.Contains("Duplicate", StringComparison.OrdinalIgnoreCase) ||
                   ex.Message.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase);
        }
    }
}
