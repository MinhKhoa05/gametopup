using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Interfaces.Orders;
using GameTopUp.DAL.Queries.Orders;

namespace GameTopUp.BLL.Services.Orders;

public sealed class OrderReadService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IOrderHistoryRepository _orderHistoryRepository;
    private readonly OrderQuery _orderQuery;

    public OrderReadService(
        IOrderRepository orderRepository,
        IOrderHistoryRepository orderHistoryRepository,
        OrderQuery orderQuery)
    {
        _orderRepository = orderRepository;
        _orderHistoryRepository = orderHistoryRepository;
        _orderQuery = orderQuery;
    }

    public Task<List<MyOrderSummaryRow>> GetMyOrdersAsync(UserContext actor, OrderStatus? status = null) =>
        _orderQuery.GetMySummaryAsync(actor.UserId, status);

    public Task<List<AdminOrderSummaryRow>> GetAdminOrdersAsync(OrderStatus? status = null) =>
        _orderQuery.GetAdminSummaryAsync(status);

    public async Task<OrderDetailResponseDTO> GetOrderDetailAsync(UserContext actor, long orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId)
            ?? throw new NotFoundException(ErrorCode.OrderNotFound);

        if (!actor.IsAdmin && order.UserId != actor.UserId)
        {
            throw new ForbiddenException(ErrorCode.CannotModifyOthersOrder);
        }

        var histories = await _orderHistoryRepository.GetByOrderIdAsync(orderId);

        return new OrderDetailResponseDTO
        {
            Order = order.MapTo<OrderResponseDTO>(),
            Histories = histories.Select(history => history.MapTo<OrderHistoryResponseDTO>()).ToList()
        };
    }
}
