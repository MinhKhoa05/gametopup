using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Services.Orders;
using GameTopUp.BLL.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/orders")]
public sealed class AdminOrderController : ApiControllerBase
{
    private readonly OrderUseCase _orderUseCase;
    private readonly OrderReadService _orderReadService;

    public AdminOrderController(OrderUseCase orderUseCase, OrderReadService orderReadService)
    {
        _orderUseCase = orderUseCase;
        _orderReadService = orderReadService;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders(
        [FromQuery] OrderFilter? filter = null,
        [FromQuery] long? cursor = null,
        [FromQuery] int? limit = null)
    {
        var orders = await _orderReadService.GetOrdersAsync(filter, cursor, limit);
        return ApiOk(orders);
    }

    [HttpPost("{orderId}/pick")]
    public async Task<IActionResult> PickOrder(long orderId)
    {
        await _orderUseCase.PickOrderAsync(orderId, CurrentUser);
        return ApiOk();
    }

    [HttpPost("{orderId}/complete")]
    public async Task<IActionResult> CompleteOrder(long orderId)
    {
        await _orderUseCase.CompleteOrderAsync(orderId, CurrentUser);
        return ApiOk();
    }
}
