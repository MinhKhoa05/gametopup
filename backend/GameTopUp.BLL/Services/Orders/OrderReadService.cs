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

    public async Task<List<OrderResponse>> GetOrdersAsync(UserContext actor, OrderStatus? status = null)
    {
        var orders = await _orderQuery.GetOrderQueryAsync(actor.UserId, status);
        return orders.Select(order => WithPublicImageUrl(order.MapTo<OrderResponse>())).ToList();
    }

    public async Task<List<AdminOrderResponse>> GetAdminOrdersAsync(OrderStatus? status = null)
    {
        var orders = await _orderQuery.GetAdminOrdersAsync(status);
        return orders.Select(order => WithPublicImageUrl(order.MapTo<AdminOrderResponse>())).ToList();
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
}
