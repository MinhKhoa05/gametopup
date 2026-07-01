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
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

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

    public async Task<List<OrderResponse>> GetOrdersAsync(UserContext actor, OrderStatus? status = null)
    {
        var orders = await _orderQuery.GetOrderQueryAsync(actor.UserId, status);
        return orders.Select(order => WithPublicImageUrl(order.MapTo<OrderResponse>())).ToList();
    }

    public async Task<CursorPageResponse<OrderResponse>> GetOrderCursorPageAsync(
        UserContext actor,
        OrderFilter? filter,
        long? cursor,
        int? limit)
    {
        var take = NormalizeLimit(limit);
        var rows = await _orderQuery.GetOrderCursorPageAsync(
            actor.UserId,
            ToOrderStatuses(filter),
            cursor,
            take + 1);

        return CursorPageMappings.ToCursorPage(
            rows,
            take,
            row => WithPublicImageUrl(row.MapTo<OrderResponse>()),
            row => row.Id);
    }

    public async Task<List<AdminOrderResponse>> GetAdminOrdersAsync(OrderStatus? status = null)
    {
        var orders = await _orderQuery.GetAdminOrdersAsync(status);
        return orders.Select(order => WithPublicImageUrl(order.MapTo<AdminOrderResponse>())).ToList();
    }

    public async Task<CursorPageResponse<AdminOrderResponse>> GetAdminOrderCursorPageAsync(
        OrderFilter? filter,
        long? cursor,
        int? limit)
    {
        var take = NormalizeLimit(limit);
        var rows = await _orderQuery.GetAdminOrderCursorPageAsync(
            ToOrderStatuses(filter),
            cursor,
            take + 1);

        return CursorPageMappings.ToCursorPage(
            rows,
            take,
            row => WithPublicImageUrl(row.MapTo<AdminOrderResponse>()),
            row => row.Id);
    }

    public async Task<OrderResponse> GetOrderAsync(UserContext actor, long orderId)
    {
        var order = await EnsureOrderAccessUser(actor, orderId);
        return WithPublicImageUrl(order.MapTo<OrderResponse>());
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

    private OrderResponse WithPublicImageUrl(OrderResponse order)
    {
        order.PackageImageUrl = _imageUrlBuilder.Build(order.PackageImageUrl);
        return order;
    }

    private AdminOrderResponse WithPublicImageUrl(AdminOrderResponse order)
    {
        order.PackageImageUrl = _imageUrlBuilder.Build(order.PackageImageUrl);
        return order;
    }

    private static IReadOnlyCollection<OrderStatus>? ToOrderStatuses(OrderFilter? filter)
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

    private static int NormalizeLimit(int? limit)
    {
        if (limit is null or <= 0)
        {
            return DefaultPageSize;
        }

        return Math.Min(limit.Value, MaxPageSize);
    }

}
