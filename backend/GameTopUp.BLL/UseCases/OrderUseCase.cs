using GameTopUp.BLL.Utilities;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Orders;
using GameTopUp.BLL.Services.Games;
using GameTopUp.BLL.Services.Wallets;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using System.Globalization;

namespace GameTopUp.BLL.UseCases;

public sealed class OrderUseCase
{
    private readonly PackageService _packageService;
    private readonly WalletService _walletService;
    private readonly OrderService _orderService;
    private readonly ITransactionManager _transaction;

    public OrderUseCase(
        PackageService packageService,
        WalletService walletService,
        OrderService orderService,
        ITransactionManager transaction)
    {
        _packageService = packageService;
        _walletService = walletService;
        _orderService = orderService;
        _transaction = transaction;
    }

    public async Task<CreateOrderResponse> PurchaseOrderAsync(UserContext actor, PurchaseOrderRequest request)
    {
        return await _transaction.ExecuteAsync(async () =>
        {
            var gameAccountInfo = InputTextNormalizer.Required(request.GameAccountInfo, ErrorCode.BadRequest);
            var package = await _packageService.GetActivePackageByIdOrThrowAsync(request.PackageId);
            var wallet = await _walletService.LockByUserIdOrThrowAsync(actor.UserId);
            var packagePrice = package.SalePrice;

            _walletService.EnsureSufficientBalance(wallet, packagePrice);
            await _packageService.ReservePackageAsync(package.Id);

            var now = DateTimeOffset.UtcNow;
            var order = new Order
            {
                UserId = actor.UserId,
                PackageId = package.Id,
                PackagePrice = packagePrice,
                PackageName = package.Name.Trim(),
                PackageCost = 0m,
                GameAccountInfo = gameAccountInfo,
                Status = OrderStatus.Pending,
                CreatedAt = now,
                UpdatedAt = now
            };
            await _orderService.CreateAsync(order, actor);

            var walletTransaction = _walletService.Debit(
                wallet,
                packagePrice,
                WalletTransactionType.PurchaseOrder,
                order.Id.ToString(CultureInfo.InvariantCulture));
            await _walletService.ApplyTransactionAsync(wallet, walletTransaction);

            return new CreateOrderResponse { OrderId = order.Id };
        });
    }

    public async Task PickOrderAsync(long orderId, UserContext actor)
    {
        await _transaction.ExecuteAsync(async () =>
        {
            var order = await _orderService.LockByIdOrThrowAsync(orderId);

            if (order.Status == OrderStatus.Processing && order.AssignedTo == actor.UserId)
            {
                return;
            }

            var package = await _packageService.GetPackageByIdOrThrowAsync(order.PackageId);
            var history = _orderService.PickOrder(order, actor, package.ImportPrice);

            await _orderService.UpdateWithHistoryAsync(order, history);
        });
    }

    public async Task CompleteOrderAsync(long orderId, UserContext actor)
    {
        await _transaction.ExecuteAsync(async () =>
        {
            var order = await _orderService.LockByIdOrThrowAsync(orderId);

            if (order.Status == OrderStatus.Completed)
            {
                return;
            }

            var history = _orderService.CompleteOrder(order, actor);
            await _orderService.UpdateWithHistoryAsync(order, history);
        });
    }

    public async Task CancelOrderAsync(long orderId, UserContext actor, string? reason = null)
    {
        await _transaction.ExecuteAsync(async () =>
        {
            var order = await _orderService.LockByIdOrThrowAsync(orderId);

            if (order.Status == OrderStatus.Cancelled)
            {
                return;
            }

            var history = _orderService.CancelOrder(order, actor, reason);
            await _orderService.UpdateWithHistoryAsync(order, history);

            await _packageService.RestorePackageAsync(order.PackageId);

            var wallet = await _walletService.LockByUserIdOrThrowAsync(order.UserId);
            var walletTransaction = _walletService.Credit(
                wallet,
                order.PackagePrice,
                WalletTransactionType.Refund,
                order.Id.ToString(CultureInfo.InvariantCulture));
            
            await _walletService.ApplyTransactionAsync(wallet, walletTransaction);
        });
    }
}
