using System.Diagnostics;
using GameTopUp.BLL.Utilities;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.BLL.Services.Orders;

public sealed class OrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IOrderHistoryRepository _orderHistoryRepository;

    public OrderService(
        IOrderRepository orderRepository,
        IOrderHistoryRepository orderHistoryRepository)
    {
        _orderRepository = orderRepository;
        _orderHistoryRepository = orderHistoryRepository;
    }

    public async Task<Order> LockByIdOrThrowAsync(long orderId)
    {
        return await _orderRepository.GetWithLockByIdAsync(orderId)
            ?? throw new NotFoundException(ErrorCode.OrderNotFound);
    }

    public async Task CreateAsync(Order order, UserContext actor)
    {
        var orderId = await _orderRepository.CreateAsync(order);
        order.Id = orderId;

        var history = OrderHistory.Create(orderId, OrderStatus.Pending, OrderStatus.Pending, actor.UserId);
        await _orderHistoryRepository.CreateAsync(history);
    }

    public async Task UpdateWithHistoryAsync(Order order, OrderHistory history)
    {
        ArgumentNullException.ThrowIfNull(order);
        ArgumentNullException.ThrowIfNull(history);

        await _orderRepository.UpdateAsync(order);
        await _orderHistoryRepository.CreateAsync(history);
    }

    public OrderHistory PickOrder(Order order, UserContext actor, decimal packageCost)
    {
        if (order.Status == OrderStatus.Processing)
        {
            throw new BusinessException(ErrorCode.OrderAlreadyAssigned);
        }

        if (order.Status != OrderStatus.Pending)
        {
            throw new BusinessException(ErrorCode.InvalidOrderStatus);
        }

        var fromStatus = order.Status;
        order.MarkProcessing(actor.UserId, packageCost);

        return CreateHistory(order, fromStatus, actor);
    }

    public OrderHistory CompleteOrder(Order order, UserContext actor)
    {
        if (order.Status != OrderStatus.Processing)
        {
            throw new BusinessException(ErrorCode.InvalidOrderStatus);
        }

        if (order.AssignedTo != actor.UserId)
        {
            throw new BusinessException(ErrorCode.Forbidden);
        }

        var fromStatus = order.Status;
        order.MarkCompleted();

        return CreateHistory(order, fromStatus, actor);
    }

    public OrderHistory CancelOrder(Order order, UserContext actor, string? reason = null)
    {
        EnsureCanCancelOrder(order, actor);

        var fromStatus = order.Status;

        order.MarkCancelled();

        return CreateHistory(order, fromStatus, actor, reason);
    }

    private static OrderHistory CreateHistory(Order order, OrderStatus fromStatus, UserContext actor, string? note = null)
    {
        return OrderHistory.Create(
            order.Id,
            fromStatus,
            order.Status,
            actor.UserId,
            InputTextNormalizer.NullIfWhiteSpace(note),
            actor.IsAdmin);
    }

    private static void EnsureCanCancelOrder(Order order, UserContext actor)
    {
        if (order.Status == OrderStatus.Completed)
        {
            throw new BusinessException(ErrorCode.InvalidOrderStatus);
        }

        if (!actor.IsAdmin)
        {
            if (order.UserId != actor.UserId)
            {
                throw new ForbiddenException(ErrorCode.Forbidden);
            }

            if (order.Status == OrderStatus.Processing)
            {
                throw new BusinessException(ErrorCode.InvalidOrderStatus);
            }

            return;
        }

        if (order.Status == OrderStatus.Processing &&
            order.AssignedTo != actor.UserId)
        {
            throw new ForbiddenException(ErrorCode.Forbidden);
        }
    }
}
