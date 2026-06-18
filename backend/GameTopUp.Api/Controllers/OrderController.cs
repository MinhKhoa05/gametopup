using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Queries.Orders;
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
    private readonly MyOrderSummaryQuery _orderSummaryQuery;

    public OrderController(OrderUseCase orderUseCase, OrderService orderService, MyOrderSummaryQuery orderSummaryQuery)
    {
        _orderUseCase = orderUseCase;
        _orderService = orderService;
        _orderSummaryQuery = orderSummaryQuery;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] PurchaseOrderRequestDTO request)
    {
        var orderId = await _orderUseCase.PurchaseOrderAsync(CurrentUser, request);
        return ApiCreated(orderId, "Order purchased successfully.");
    }

    [HttpGet]
    public async Task<IActionResult> GetMyOrders([FromQuery] OrderStatus? status = null)
    {
        var orders = await _orderSummaryQuery.GetByUserIdAsync(CurrentUser.UserId, status);
        return ApiOk(orders);
    }

    [HttpGet("{orderId}/history")]
    public async Task<IActionResult> GetOrderHistories(long orderId)
    {
        await EnsureCanAccessOrderAsync(orderId);
        var histories = await _orderService.GetHistoriesAsync(orderId);
        return ApiOk(histories);
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrderById(long orderId)
    {
        await EnsureCanAccessOrderAsync(orderId);
        var order = await _orderService.GetByIdOrThrowAsync(orderId);
        return ApiOk(order);
    }

    [HttpPost("{orderId}/cancel")]
    public async Task<IActionResult> CancelOrder(long orderId)
    {
        var result = await _orderUseCase.CancelOrderAsync(orderId, CurrentUser);
        return ApiOk(result, "Order cancelled successfully.");
    }

    private async Task EnsureCanAccessOrderAsync(long orderId)
    {
        var order = await _orderService.GetByIdOrThrowAsync(orderId);
        if (!CurrentUser.IsAdmin && order.UserId != CurrentUser.UserId)
        {
            throw new ForbiddenException(ErrorCode.Forbidden);
        }
    }
}
