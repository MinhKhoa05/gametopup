using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Mappers.Orders;
using GameTopUp.BLL.Services;

namespace GameTopUp.BLL.Queries.Orders;

public sealed class OrderTimelineQuery
{
    private readonly OrderService _orderService;

    public OrderTimelineQuery(OrderService orderService)
    {
        _orderService = orderService;
    }

    public async Task<OrderTimelineResponseDTO> GetByOrderIdAsync(long orderId)
    {
        var order = await _orderService.GetByIdOrThrowAsync(orderId);
        var histories = await _orderService.GetHistoriesAsync(orderId);

        return OrderTimelineMapper.ToTimelineResponse(order, histories);
    }
}
