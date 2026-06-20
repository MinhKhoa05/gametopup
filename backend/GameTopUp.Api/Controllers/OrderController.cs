using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Services;
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

    public OrderController(OrderUseCase orderUseCase, OrderService orderService)
    {
        _orderUseCase = orderUseCase;
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] PurchaseOrderRequestDTO request)
    {
        var order = await _orderUseCase.PurchaseOrderAsync(CurrentUser, request);
        return ApiCreated(order);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyOrders([FromQuery] OrderStatus? status = null)
    {
        var orders = await _orderService.GetMyOrdersAsync(CurrentUser, status);
        return ApiOk(orders);
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrderById(long orderId)
    {
        var detail = await _orderService.GetOrderDetailAsync(CurrentUser, orderId);
        return ApiOk(detail);
    }

    [HttpPost("{orderId}/cancel")]
    public async Task<IActionResult> CancelOrder(long orderId)
    {
        var order = await _orderUseCase.CancelOrderAsync(orderId, CurrentUser);
        return ApiOk(order);
    }
}
