using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Services.Orders;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Entities.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Authorize]
[Route("api/orders")]
public sealed class OrderController : ApiControllerBase
{
    private readonly OrderUseCase _orderUseCase;
    private readonly OrderService _orderService;
    private readonly OrderReadService _orderReadService;

    public OrderController(OrderUseCase orderUseCase, OrderService orderService, OrderReadService orderReadService)
    {
        _orderUseCase = orderUseCase;
        _orderService = orderService;
        _orderReadService = orderReadService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] PurchaseOrderRequest request)
    {
        var createOrderResponse = await _orderUseCase.PurchaseOrderAsync(CurrentUser, request);
        return ApiCreated(createOrderResponse);
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status = null)
    {
        var orders = await _orderReadService.GetOrdersAsync(CurrentUser, status);
        return ApiOk(orders);
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrderById(long orderId)
    {
        var detail = await _orderReadService.GetOrderDetailAsync(CurrentUser, orderId);
        return ApiOk(detail);
    }

    [HttpPost("{orderId}/cancel")]
    public async Task<IActionResult> CancelOrder(long orderId)
    {
        await _orderUseCase.CancelOrderAsync(orderId, CurrentUser);
        return ApiOk();
    }
}
