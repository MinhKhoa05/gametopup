using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Exceptions;
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

    public async Task<long> PurchaseOrderAsync(UserContext context, PurchaseOrderRequestDTO request)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var gameAccountInfo = request.GameAccountInfo.Trim();
            if (string.IsNullOrWhiteSpace(gameAccountInfo))
            {
                throw new BusinessException(ErrorCode.BadRequest);
            }

            var package = await _packageService.GetPackageByIdOrThrowAsync(request.GamePackageId);
            if (!package.IsActive)
            {
                throw new BusinessException(ErrorCode.GamePackageInactive);
            }

            var orderId = await _orderService.CreateOrderAsync(context, package, gameAccountInfo);

            await _walletService.ChargeOrderAsync(context.UserId, orderId, package.SalePrice);
            await _packageService.ReservePackageAsync(package.Id);

            return orderId;
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

            await _packageService.RestorePackageAsync(order.GamePackageId);
            await _walletService.RefundOrderAsync(order.UserId, order.Id, order.Total, reason);

            return MapToActionResponse(result);
        });
    }

    private static OrderActionResponseDTO MapToActionResponse(OrderChangeResult result)
    {
        return new OrderActionResponseDTO
        {
            OrderId = result.Order.Id,
            FromStatus = result.FromStatus,
            ToStatus = result.Order.Status,
            Changed = result.Changed,
            AssignTo = result.Order.AssignedTo,
            AssignAt = result.Order.AssignedAt,
            UpdatedAt = result.Order.UpdatedAt
        };
    }
}
