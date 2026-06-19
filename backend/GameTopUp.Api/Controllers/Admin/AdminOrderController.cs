using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Entities.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/orders")]
public sealed class AdminOrderController : ApiControllerBase
{
    private readonly OrderUseCase _orderUseCase;
    private readonly OrderService _orderService;

    public AdminOrderController(OrderUseCase orderUseCase, OrderService orderService)
    {
        _orderUseCase = orderUseCase;
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status = null)
    {
        var orders = await _orderService.GetAdminOrderSummariesAsync(status);
        return ApiOk(orders);
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrderById(long orderId)
    {
        var order = await _orderService.GetOrderByIdOrThrowAsync(orderId);
        return ApiOk(order);
    }

    [HttpGet("{orderId}/history")]
    public async Task<IActionResult> GetOrderHistories(long orderId)
    {
        var histories = await _orderService.GetHistoriesAsync(orderId);
        return ApiOk(histories);
    }

    [HttpPost("{orderId}/pick")]
    public async Task<IActionResult> PickOrder(long orderId)
    {
        var order = await _orderUseCase.PickOrderAsync(orderId, CurrentUser);
        return ApiOk(order);
    }

    [HttpPost("{orderId}/complete")]
    public async Task<IActionResult> CompleteOrder(long orderId)
    {
        var order = await _orderUseCase.CompleteOrderAsync(orderId, CurrentUser);
        return ApiOk(order);
    }

    [HttpPost("{orderId}/cancel")]
    public async Task<IActionResult> CancelOrder(long orderId)
    {
        var order = await _orderUseCase.CancelOrderAsync(orderId, CurrentUser);
        return ApiOk(order);
    }
}
