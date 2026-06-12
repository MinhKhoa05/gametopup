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

    [HttpPost("place")]
    public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequestDTO request)
    {
        var orderId = await _orderUseCase.PlaceOrderAsync(CurrentUser, request);
        return ApiCreated(orderId, "Order placed successfully.");
    }

    [HttpPost("{orderId}/pay")]
    public async Task<IActionResult> PayOrder(long orderId)
    {
        var result = await _orderUseCase.PayOrderAsync(orderId, CurrentUser);
        return ApiOk(result, "Order paid successfully.");
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyOrders([FromQuery] OrderStatus? status = null)
    {
        var orders = await _orderService.GetOrdersByUserAsync(CurrentUser, status);
        return ApiOk(orders);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status = null)
    {
        var orders = await _orderService.GetAllOrdersAsync(status);
        return ApiOk(orders);
    }

    [HttpGet("{orderId}/history")]
    public async Task<IActionResult> GetOrderHistories(long orderId)
    {
        var histories = await _orderService.GetHistoriesAsync(orderId);
        return ApiOk(histories);
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrderById(long orderId)
    {
        var order = await _orderService.GetByIdOrThrowAsync(orderId);
        return ApiOk(order);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{orderId}/pick")]
    public async Task<IActionResult> PickOrder(long orderId)
    {
        var result = await _orderUseCase.PickOrderAsync(orderId, CurrentUser);
        return ApiOk(result, "Order picked successfully.");
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{orderId}/complete")]
    public async Task<IActionResult> CompleteOrder(long orderId)
    {
        var result = await _orderUseCase.CompleteOrderAsync(orderId, CurrentUser);
        return ApiOk(result, "Order completed successfully.");
    }

    [HttpPost("{orderId}/cancel")]
    public async Task<IActionResult> CancelOrder(long orderId)
    {
        var result = await _orderUseCase.CancelOrderAsync(orderId, CurrentUser);
        return ApiOk(result, "Order cancelled successfully.");
    }
}
