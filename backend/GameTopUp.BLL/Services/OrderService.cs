using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Interfaces.Orders;

namespace GameTopUp.BLL.Services;

public sealed class OrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IOrderHistoryRepository _orderHistoryRepository;

    public OrderService(IOrderRepository orderRepository, IOrderHistoryRepository orderHistoryRepository)
    {
        _orderRepository = orderRepository;
        _orderHistoryRepository = orderHistoryRepository;
    }

    public Task<List<Order>> GetOrdersByUserAsync(UserContext context, OrderStatus? status = null) =>
        _orderRepository.GetByUserIdAsync(context.UserId, status);

    public Task<List<Order>> GetAllOrdersAsync(OrderStatus? status = null) =>
        _orderRepository.GetAllAsync(status);

    public Task<List<OrderHistory>> GetHistoriesAsync(long orderId) =>
        _orderHistoryRepository.GetByOrderIdAsync(orderId);

    public async Task<Order> GetByIdOrThrowAsync(long orderId, bool withLock = false)
    {
        var order = withLock
            ? await _orderRepository.GetWithLockByIdAsync(orderId)
            : await _orderRepository.GetByIdAsync(orderId);

        return order ?? throw new NotFoundException(ErrorCode.OrderNotFound, $"Order #{orderId} was not found.");
    }

    public Task<Order> GetWithLockByIdOrThrowAsync(long orderId) => GetByIdOrThrowAsync(orderId, withLock: true);

    public async Task<long> CreateOrderAsync(UserContext context, GamePackage package, string gameAccountInfo)
    {
        var order = Order.Create(context.UserId, package.Id, package.SalePrice, gameAccountInfo, OrderStatus.Pending);

        var newOrderId = await _orderRepository.CreateAsync(order);
        order.Id = newOrderId;

        await _orderHistoryRepository.CreateAsync(
            OrderHistory.Create(
                newOrderId,
                OrderStatus.Pending,
                OrderStatus.Pending,
                context.UserId,
                "Order created in pending state."));

        return newOrderId;
    }

    public async Task<OrderChangeResult> PickOrderAsync(Order order, UserContext admin)
    {
        if (order.Status == OrderStatus.Processing && order.AssignedTo == admin.UserId)
        {
            return OrderChangeResult.Unchanged(order);
        }

        if (order.Status == OrderStatus.Processing)
        {
            throw new BusinessException(ErrorCode.OrderAlreadyAssigned);
        }

        if (order.Status != OrderStatus.Pending)
        {
            throw new BusinessException(ErrorCode.OrderNotReadyForPick);
        }

        var fromStatus = order.Status;
        order.MarkProcessing(admin.UserId);

        await SaveChangeAsync(order, fromStatus, $"Admin {admin.DisplayName} picked the order.", admin);
        return OrderChangeResult.ChangedStatus(order, fromStatus);
    }

    public async Task<OrderChangeResult> CompleteOrderAsync(Order order, UserContext admin)
    {
        var fromStatus = order.Status;

        if (order.Status == OrderStatus.Completed)
        {
            return OrderChangeResult.Unchanged(order);
        }

        if (order.Status != OrderStatus.Processing)
        {
            throw new BusinessException(ErrorCode.OrderStatusInvalidToComplete);
        }
        
        if (order.AssignedTo != admin.UserId)
        {
            throw new BusinessException(ErrorCode.CannotModifyOthersOrder);
        }

        order.MarkCompleted();
        await SaveChangeAsync(order, fromStatus, $"Admin {admin.DisplayName} completed the order.", admin);
        return OrderChangeResult.ChangedStatus(order, fromStatus);
    }

    public async Task<OrderChangeResult> CancelOrderAsync(Order order, UserContext actor, string? reason = null)
    {
        if (order.Status == OrderStatus.Cancelled)
        {
            return OrderChangeResult.Unchanged(order);
        }

        if (order.Status == OrderStatus.Completed)
        {
            throw new BusinessException(ErrorCode.CompletedOrderCannotBeCancelled);
        }

        if (actor.UserId == order.UserId)
        {
            if (order.Status != OrderStatus.Pending)
            {
                throw new ForbiddenException(ErrorCode.ProcessingOrderCannotBeCancelled);
            }
        }
        else if (actor.IsAdmin)
        {
            var canCancelPendingOrder = order.Status == OrderStatus.Pending;
            var canCancelProcessingOrder = order.Status == OrderStatus.Processing && order.AssignedTo == actor.UserId;

            if (!canCancelPendingOrder && !canCancelProcessingOrder)
            {
                throw new ForbiddenException(ErrorCode.CannotModifyOthersOrder);
            }
        }
        else
        {
            throw new ForbiddenException(ErrorCode.CannotModifyOthersOrder);
        }

        var fromStatus = order.Status;
        order.MarkCancelled();
        await SaveChangeAsync(order, fromStatus, BuildCancelNote(reason), actor);
        return OrderChangeResult.ChangedStatus(order, fromStatus);
    }

    private async Task SaveChangeAsync(Order order, OrderStatus fromStatus, string note, UserContext actor)
    {
        await _orderRepository.UpdateAsync(order);

        await _orderHistoryRepository.CreateAsync(
            OrderHistory.Create(
                order.Id,
                fromStatus,
                order.Status,
                actor.UserId,
                note,
                actor.IsAdmin));
    }

    private static string BuildCancelNote(string? reason)
    {
        return "Order cancelled." + (string.IsNullOrWhiteSpace(reason) ? string.Empty : $" Reason: {reason}");
    }

}
