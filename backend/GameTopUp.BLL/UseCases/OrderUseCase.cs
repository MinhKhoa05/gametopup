using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Services.Games;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.BLL.UseCases;

public sealed class OrderUseCase
{
    private readonly GamePackageService _packageService;
    private readonly WalletService _walletService;
    private readonly OrderService _orderService;
    private readonly DatabaseContext _database;

    public OrderUseCase(
        GamePackageService packageService,
        WalletService walletService,
        OrderService orderService,
        DatabaseContext database)
    {
        _packageService = packageService;
        _walletService = walletService;
        _orderService = orderService;
        _database = database;
    }

    public async Task<long> PlaceOrderAsync(UserContext context, PlaceOrderRequestDTO request)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var package = await _packageService.GetAvailablePackageAsync(request.GamePackageId, request.Quantity);
            await _packageService.DecreaseStockAsync(package.Id, request.Quantity);
            return await _orderService.CreateOrderAsync(context, package, request.Quantity, request.GameAccountInfo);
        });
    }

    public async Task<OrderActionResponseDTO> PayOrderAsync(long orderId, UserContext context)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var order = await _orderService.GetWithLockByIdOrThrowAsync(orderId);
            if (order.Status == OrderStatus.Paid)
            {
                return MapToActionResponse(OrderChangeResult.Unchanged(order));
            }

            if (!_orderService.ValidateForPayment(order, context))
            {
                return MapToActionResponse(OrderChangeResult.Unchanged(order));
            }

            await _walletService.PayOrderAsync(order.UserId, order.Id, order.Total);
            var result = await _orderService.MarkAsPaidAsync(order, context);

            return MapToActionResponse(result);
        });
    }

    public async Task<OrderActionResponseDTO> PickOrderAsync(long orderId, UserContext adminContext)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var order = await _orderService.GetWithLockByIdOrThrowAsync(orderId);
            var result = await _orderService.PickOrderAsync(order, adminContext);
            return MapToActionResponse(result);
        });
    }

    public async Task<OrderActionResponseDTO> CompleteOrderAsync(long orderId, UserContext adminContext)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var order = await _orderService.GetWithLockByIdOrThrowAsync(orderId);
            var result = await _orderService.CompleteOrderAsync(order, adminContext);
            return MapToActionResponse(result);
        });
    }

    public async Task<OrderActionResponseDTO> CancelOrderAsync(long orderId, UserContext userContext, string? reason = null)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var order = await _orderService.GetWithLockByIdOrThrowAsync(orderId);
            var result = await _orderService.CancelOrderAsync(order, userContext, reason);

            if (!result.Changed)
            {
                return MapToActionResponse(result);
            }

            await _packageService.IncreaseStockAsync(order.GamePackageId, order.Quantity);

            if (result.FromStatus is OrderStatus.Paid or OrderStatus.Processing)
            {
                await _walletService.RefundOrderAsync(order.UserId, order.Id, order.Total, reason);
            }

            return MapToActionResponse(result);
        });
    }

    private static OrderActionResponseDTO MapToActionResponse(OrderChangeResult result)
    {
        return new OrderActionResponseDTO
        {
            OrderId = result.Order.Id,
            FromStatus = result.FromStatus,
            ToStatus = result.ToStatus,
            Changed = result.Changed,
            AssignTo = result.Order.AssignedTo,
            AssignAt = result.Order.AssignedAt,
            UpdatedAt = result.Order.UpdatedAt
        };
    }
}
