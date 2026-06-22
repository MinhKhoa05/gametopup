using GameTopUp.BLL.Services.Orders;
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
    private readonly OrderReadService _orderReadService;

    public AdminOrderController(OrderUseCase orderUseCase, OrderReadService orderReadService)
    {
        _orderUseCase = orderUseCase;
        _orderReadService = orderReadService;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status = null)
    {
        var orders = await _orderReadService.GetAdminOrdersAsync(status);
        return ApiOk(orders);
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrderById(long orderId)
    {
        var detail = await _orderReadService.GetOrderDetailAsync(CurrentUser, orderId);
        return ApiOk(detail);
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

    [HttpPost("{orderId}/cancel")]
    public async Task<IActionResult> CancelOrder(long orderId)
    {
        await _orderUseCase.CancelOrderAsync(orderId, CurrentUser);
        return ApiOk();
    }
}
