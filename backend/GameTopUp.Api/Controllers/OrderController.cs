using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Services.Orders;
using GameTopUp.BLL.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Authorize]
[Route("api/orders")]
public sealed class OrderController : ApiControllerBase
{
    private readonly OrderUseCase _orderUseCase;
    private readonly OrderReadService _orderReadService;

    public OrderController(OrderUseCase orderUseCase, OrderReadService orderReadService)
    {
        _orderUseCase = orderUseCase;
        _orderReadService = orderReadService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] PurchaseOrderRequest request)
    {
        var createOrderResponse = await _orderUseCase.PurchaseOrderAsync(CurrentUser, request);
        return ApiCreated(createOrderResponse);
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders(
        [FromQuery] OrderFilter? filter = null,
        [FromQuery] long? cursor = null,
        [FromQuery] int? limit = null)
    {
        var orders = await _orderReadService.GetOrdersByUserAsync(CurrentUser, filter, cursor, limit);
        return ApiOk(orders);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetOrderStats()
    {
        var stats = await _orderReadService.GetOrderStatsAsync(CurrentUser);
        return ApiOk(stats);
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrderById(long orderId)
    {
        var order = await _orderReadService.GetOrderAsync(CurrentUser, orderId);
        return ApiOk(order);
    }

    [HttpGet("{orderId}/history")]
    public async Task<IActionResult> GetOrderHistory(long orderId)
    {
        var history = await _orderReadService.GetOrderHistoryAsync(CurrentUser, orderId);
        return ApiOk(history);
    }

    [HttpPost("{orderId}/cancel")]
    public async Task<IActionResult> CancelOrder(long orderId)
    {
        await _orderUseCase.CancelOrderAsync(orderId, CurrentUser);
        return ApiOk();
    }
}
