using GameTopUp.BLL.Common;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Services.Games;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Wallets;
using System.Globalization;

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

    public async Task<OrderResponseDTO> PurchaseOrderAsync(UserContext actor, PurchaseOrderRequestDTO request)
    {
        var order = await _database.ExecuteInTransactionAsync(async () =>
        {
            var gameAccountInfo = InputTextNormalizer.Required(request.GameAccountInfo, ErrorCode.BadRequest);
            var package = await _packageService.GetActivePackageByIdOrThrowAsync(request.GamePackageId);
            var wallet = await _walletService.LockByUserIdOrThrowAsync(actor.UserId);
            var packagePrice = package.SalePrice;

            _walletService.EnsureSufficientBalance(wallet, packagePrice);
            await _packageService.ReservePackageAsync(package.Id);

            var order = Order.Create(actor.UserId, package.Id, packagePrice, gameAccountInfo);
            await _orderService.CreateAsync(order, actor);

            var walletTransaction = _walletService.Debit(
                wallet,
                packagePrice,
                WalletTransactionType.PurchaseOrder,
                order.Id.ToString(CultureInfo.InvariantCulture));
            await _walletService.ApplyTransactionAsync(wallet, walletTransaction);

            return order;
        });

        return order.MapTo<OrderResponseDTO>();
    }

    public async Task<OrderResponseDTO> PickOrderAsync(long orderId, UserContext actor)
    {
        var order = await _database.ExecuteInTransactionAsync(async () =>
        {
            var order = await _orderService.LockByIdOrThrowAsync(orderId);

            if (order.Status == OrderStatus.Processing && order.AssignedTo == actor.UserId)
            {
                return order;
            }

            var history = _orderService.PickOrder(order, actor);
            await _orderService.UpdateWithHistoryAsync(order, history);

            return order;
        });

        return order.MapTo<OrderResponseDTO>();
    }

    public async Task<OrderResponseDTO> CompleteOrderAsync(long orderId, UserContext actor)
    {
        var order = await _database.ExecuteInTransactionAsync(async () =>
        {
            var order = await _orderService.LockByIdOrThrowAsync(orderId);

            if (order.Status == OrderStatus.Completed)
            {
                return order;
            }

            var history = _orderService.CompleteOrder(order, actor);
            await _orderService.UpdateWithHistoryAsync(order, history);

            return order;
        });

        return order.MapTo<OrderResponseDTO>();
    }

    public async Task<OrderResponseDTO> CancelOrderAsync(long orderId, UserContext actor, string? reason = null)
    {
        var order = await _database.ExecuteInTransactionAsync(async () =>
        {
            var order = await _orderService.LockByIdOrThrowAsync(orderId);

            if (order.Status == OrderStatus.Cancelled)
            {
                return order;
            }

            var history = _orderService.CancelOrder(order, actor, reason);
            await _orderService.UpdateWithHistoryAsync(order, history);

            await _packageService.RestorePackageAsync(order.GamePackageId);
            
            var wallet = await _walletService.LockByUserIdOrThrowAsync(order.UserId);
            var walletTransaction = _walletService.Credit(
                wallet,
                order.PackagePrice,
                WalletTransactionType.Refund,
                order.Id.ToString(CultureInfo.InvariantCulture));
            await _walletService.ApplyTransactionAsync(wallet, walletTransaction);

            return order;
        });

        return order.MapTo<OrderResponseDTO>();
    }
}
