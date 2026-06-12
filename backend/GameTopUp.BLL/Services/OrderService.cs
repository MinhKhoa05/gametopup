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

    public async Task<long> CreateOrderAsync(UserContext context, GamePackage package, int quantity, string gameAccountInfo)
    {
        if (await _orderRepository.HasPendingOrderAsync(context.UserId))
        {
            throw new BusinessException(ErrorCode.PendingOrderExists);
        }

        var order = Order.Create(context.UserId, package.Id, package.SalePrice, quantity, gameAccountInfo);

        try
        {
            var newOrderId = await _orderRepository.CreateAsync(order);
            order.Id = newOrderId;

            await _orderHistoryRepository.CreateAsync(
                OrderHistory.Create(
                    newOrderId,
                    order.Status,
                    order.Status,
                    context.UserId,
                    "Order created and waiting for payment."));

            return newOrderId;
        }
        catch (Exception ex) when (IsDuplicateError(ex))
        {
            throw new BusinessException(ErrorCode.PendingOrderExists);
        }
    }

    public async Task<OrderChangeResult> PickOrderAsync(Order order, UserContext admin)
    {
        var fromStatus = order.Status;

        if (order.Status == OrderStatus.Processing && order.AssignedTo == admin.UserId)
        {
            return OrderChangeResult.Unchanged(order);
        }

        if (order.Status == OrderStatus.Processing)
        {
            throw new BusinessException(ErrorCode.OrderAlreadyAssigned);
        }

        EnsureTransition(fromStatus, OrderStatus.Processing);
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

        EnsureTransition(fromStatus, OrderStatus.Completed);

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

        var isOwner = order.UserId == actor.UserId;
        var isAssignedAdmin = order.AssignedTo == actor.UserId;
        if (!isOwner && !isAssignedAdmin)
        {
            throw new ForbiddenException(ErrorCode.CannotModifyOthersOrder);
        }

        if (order.Status == OrderStatus.Processing && isOwner)
        {
            throw new ForbiddenException(ErrorCode.ProcessingOrderCannotBeCancelled);
        }

        var fromStatus = order.Status;
        order.MarkCancelled();
        await SaveChangeAsync(order, fromStatus, BuildCancelNote(reason), actor);
        return OrderChangeResult.ChangedStatus(order, fromStatus);
    }

    public bool ValidateForPayment(Order order, UserContext user)
    {
        if (order.UserId != user.UserId)
        {
            throw new BusinessException(ErrorCode.PaymentForbidden);
        }

        if (order.Status == OrderStatus.Paid)
        {
            return false;
        }

        EnsureTransition(order.Status, OrderStatus.Paid);
        return true;
    }

    public async Task<OrderChangeResult> MarkAsPaidAsync(Order order, UserContext user)
    {
        if (order.UserId != user.UserId)
        {
            throw new BusinessException(ErrorCode.PaymentForbidden);
        }

        return await UpdateStatusAsync(order, OrderStatus.Paid, "Order paid successfully.", user);
    }

    private async Task<OrderChangeResult> UpdateStatusAsync(Order order, OrderStatus toStatus, string note, UserContext actor)
    {
        var fromStatus = order.Status;
        if (!TryValidateTransition(fromStatus, toStatus))
        {
            return OrderChangeResult.Unchanged(order);
        }

        if (toStatus == OrderStatus.Paid)
        {
            order.MarkPaid();
        }
        else if (toStatus == OrderStatus.Completed)
        {
            order.MarkCompleted();
        }
        else if (toStatus == OrderStatus.Cancelled)
        {
            order.MarkCancelled();
        }
        else
        {
            order.UpdateStatus(toStatus);
        }
        await SaveChangeAsync(order, fromStatus, note, actor);
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

    private static void EnsureTransition(OrderStatus fromStatus, OrderStatus toStatus)
    {
        if (!TryValidateTransition(fromStatus, toStatus))
        {
            throw new BusinessException(GetTransitionError(toStatus));
        }
    }

    private static bool TryValidateTransition(OrderStatus fromStatus, OrderStatus toStatus)
    {
        if (fromStatus == toStatus)
        {
            return false;
        }

        return toStatus switch
        {
            OrderStatus.Paid => fromStatus == OrderStatus.Pending,
            OrderStatus.Processing => fromStatus == OrderStatus.Paid,
            OrderStatus.Completed => fromStatus == OrderStatus.Processing,
            OrderStatus.Cancelled => fromStatus != OrderStatus.Completed,
            _ => false
        };
    }

    private static ErrorCode GetTransitionError(OrderStatus toStatus)
    {
        return toStatus switch
        {
            OrderStatus.Paid => ErrorCode.OrderNotPendingPayment,
            OrderStatus.Processing => ErrorCode.OrderMustBePaidToPick,
            OrderStatus.Completed => ErrorCode.OrderStatusInvalidToComplete,
            OrderStatus.Cancelled => ErrorCode.CompletedOrderCannotBeCancelled,
            _ => ErrorCode.BadRequest
        };
    }

    private static string BuildCancelNote(string? reason)
    {
        return "Order cancelled." + (string.IsNullOrWhiteSpace(reason) ? string.Empty : $" Reason: {reason}");
    }

    private static bool IsDuplicateError(Exception ex)
    {
        return ex.Message.Contains("Duplicate", StringComparison.OrdinalIgnoreCase)
            || ex.Message.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase);
    }
}
