using GameTopUp.BLL.Context;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Interfaces.Orders;
using GameTopUp.DAL.Queries.Orders;

namespace GameTopUp.BLL.Services;

public sealed class OrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IOrderHistoryRepository _orderHistoryRepository;
    private readonly OrderQuery _orderQuery;

    public OrderService(
        IOrderRepository orderRepository,
        IOrderHistoryRepository orderHistoryRepository,
        OrderQuery orderQuery)
    {
        _orderRepository = orderRepository;
        _orderHistoryRepository = orderHistoryRepository;
        _orderQuery = orderQuery;
    }

    public async Task<List<MyOrderSummaryRow>> GetMyOrderSummariesAsync(long userId, OrderStatus? status = null)
    {
        return await _orderQuery.GetMySummaryAsync(userId, status);
    }

    public async Task<List<AdminOrderSummaryRow>> GetAdminOrderSummariesAsync(OrderStatus? status = null)
    {
        return await _orderQuery.GetAdminSummaryAsync(status);
    }

    public Task<List<OrderHistory>> GetHistoriesAsync(long orderId) =>
        _orderHistoryRepository.GetByOrderIdAsync(orderId);

    public async Task<Order> GetOrderByIdOrThrowAsync(long orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);

        return order ?? throw new NotFoundException(ErrorCode.OrderNotFound, $"Order #{orderId} was not found.");
    }

    public OrderHistory PickOrder(Order order, UserContext actor)
    {
        if (order.Status == OrderStatus.Processing)
        {
            throw new BusinessException(ErrorCode.OrderAlreadyAssigned);
        }

        if (order.Status != OrderStatus.Pending)
        {
            throw new BusinessException(ErrorCode.OrderNotReadyForPick);
        }

        order.MarkProcessing(actor.UserId);
        
        return OrderHistory.Create(
            order.Id,
            OrderStatus.Pending,
            order.Status,
            actor.UserId,
            $"Admin {actor.DisplayName} picked the order.",
            actor.IsAdmin);
    }

    public OrderHistory CompleteOrder(Order order, UserContext actor)
    {
        if (order.Status != OrderStatus.Processing)
        {
            throw new BusinessException(ErrorCode.OrderStatusInvalidToComplete);
        }
        
        if (order.AssignedTo != actor.UserId)
        {
            throw new BusinessException(ErrorCode.CannotModifyOthersOrder);
        }

        order.MarkCompleted();
        
        return OrderHistory.Create(
            order.Id,
            OrderStatus.Processing,
            order.Status,
            actor.UserId,
            $"Admin {actor.DisplayName} completed the order.",
            actor.IsAdmin);
    }

    public OrderHistory CancelOrder(Order order, UserContext actor, string? reason = null)
    {
        EnsureOrderCanCancel(order, actor);

        var fromStatus = order.Status;
        order.MarkCancelled();
        var note = "Order cancelled." + (string.IsNullOrWhiteSpace(reason) ? string.Empty : $" Reason: {reason}");

        return OrderHistory.Create(
            order.Id,
            fromStatus,
            order.Status,
            actor.UserId,
            note,
            actor.IsAdmin);
    }

    private static void EnsureOrderCanCancel(Order order, UserContext actor)
    {
        if (order.Status == OrderStatus.Completed)
        {
            throw new BusinessException(ErrorCode.OrderCannotBeCancelled);
        }

        if (actor.IsAdmin)
        {
            EnsureAdminCanCancel(order, actor);
            return;
        }

        EnsureUserCanCancel(order, actor);
    }

    private static void EnsureUserCanCancel(Order order, UserContext actor)
    {
        if (actor.UserId != order.UserId)
        {
            throw new ForbiddenException(ErrorCode.CannotModifyOthersOrder);
        }

        if (order.Status != OrderStatus.Pending)
        {
            throw new ForbiddenException(ErrorCode.OrderCannotBeCancelled);
        }
    }

    private static void EnsureAdminCanCancel(Order order, UserContext admin)
    {
        var canCancelPendingOrder = order.Status == OrderStatus.Pending;
        var canCancelProcessingOrder = order.Status == OrderStatus.Processing && order.AssignedTo == admin.UserId;

        if (!canCancelPendingOrder && !canCancelProcessingOrder)
        {
            throw new ForbiddenException(
                ErrorCode.CannotModifyOthersOrder,
                order.Status == OrderStatus.Processing
                    ? "Không thể hủy đơn hàng của người khác."
                    : "Không thể hủy đơn hàng ở trạng thái hiện tại.");
        }
    }
}
