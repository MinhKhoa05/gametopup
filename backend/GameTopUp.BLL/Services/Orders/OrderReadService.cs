using GameTopUp.BLL.Context;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Services.Images;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using GameTopUp.DAL.Queries;

namespace GameTopUp.BLL.Services.Orders;

public sealed class OrderReadService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IOrderHistoryRepository _orderHistoryRepository;
    private readonly OrderQuery _orderQuery;
    private readonly PublicImageUrlBuilder _imageUrlBuilder;

    public OrderReadService(
        IOrderRepository orderRepository,
        IOrderHistoryRepository orderHistoryRepository,
        OrderQuery orderQuery,
        PublicImageUrlBuilder imageUrlBuilder)
    {
        _orderRepository = orderRepository;
        _orderHistoryRepository = orderHistoryRepository;
        _orderQuery = orderQuery;
        _imageUrlBuilder = imageUrlBuilder;
    }

    public async Task<CursorPageResponse<OrderResponse>> GetOrdersByUserAsync(
        UserContext actor,
        OrderFilter? filter,
        long? cursor,
        int? limit)
    {
        return await CursorPageMappings.ToCursorPageAsync(
            limit,
            take => _orderQuery.GetOrdersByUserAsync(
                actor.UserId,
                ToOrderStatuses(filter),
                cursor,
                take),
            BuildOrderResponse,
            row => row.Id);
    }

    public async Task<CursorPageResponse<AdminOrderResponse>> GetOrdersAsync(
        OrderFilter? filter,
        long? cursor,
        int? limit)
    {
        return await CursorPageMappings.ToCursorPageAsync(
            limit,
            take => _orderQuery.GetOrdersAsync(
                ToOrderStatuses(filter),
                cursor,
                take),
            BuildAdminOrderResponse,
            row => row.Id);
    }

    public async Task<OrderResponse> GetOrderAsync(UserContext actor, long orderId)
    {
        var order = await EnsureOrderAccessUser(actor, orderId);
        return BuildOrderResponse(order);
    }

    public async Task<OrderStatsResponse> GetOrderStatsAsync(UserContext actor)
    {
        return await _orderQuery.GetOrderStatsByUserAsync(actor.UserId);
    }

    public async Task<List<OrderHistoryResponse>> GetOrderHistoryAsync(UserContext actor, long orderId)
    {
        await EnsureOrderAccessUser(actor, orderId);

        var history = await _orderHistoryRepository.GetByOrderIdAsync(orderId);
        return history.Select(h => h.MapTo<OrderHistoryResponse>()).ToList();
    }

    private async Task<Order> EnsureOrderAccessUser(UserContext actor, long orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId)
            ?? throw new NotFoundException(ErrorCode.OrderNotFound);

        if (!actor.IsAdmin && order.UserId != actor.UserId)
        {
            throw new ForbiddenException(ErrorCode.Forbidden);
        }

        return order;
    }

    private OrderResponse BuildOrderResponse(OrderQueryRow row)
    {
        var response = row.MapTo<OrderResponse>();
        response.PackageImageUrl = _imageUrlBuilder.Build(response.PackageImageUrl);
        return response;
    }

    private AdminOrderResponse BuildAdminOrderResponse(OrderQueryRow row)
    {
        var response = row.MapTo<AdminOrderResponse>();
        response.PackageImageUrl = _imageUrlBuilder.Build(response.PackageImageUrl);
        return response;
    }

    private OrderResponse BuildOrderResponse(Order order)
    {
        var response = order.MapTo<OrderResponse>();
        response.PackageImageUrl = _imageUrlBuilder.Build(response.PackageImageUrl);
        return response;
    }

    private static OrderStatus[]? ToOrderStatuses(OrderFilter? filter)
    {
        return filter switch
        {
            OrderFilter.Watching => [OrderStatus.Pending, OrderStatus.Processing],
            OrderFilter.Pending => [OrderStatus.Pending],
            OrderFilter.Processing => [OrderStatus.Processing],
            OrderFilter.Completed => [OrderStatus.Completed],
            OrderFilter.Cancelled => [OrderStatus.Cancelled],
            _ => null
        };
    }

}
