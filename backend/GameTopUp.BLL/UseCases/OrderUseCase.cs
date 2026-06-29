using GameTopUp.BLL.Utilities;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Orders;
using GameTopUp.BLL.Services.Games;
using GameTopUp.BLL.Services.Wallets;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using System.Globalization;

namespace GameTopUp.BLL.UseCases;

public sealed class OrderUseCase
{
    private readonly GamePackageService _packageService;
    private readonly IGameRepository _gameRepository;
    private readonly WalletService _walletService;
    private readonly OrderService _orderService;
    private readonly ITransactionManager _transaction;

    public OrderUseCase(
        GamePackageService packageService,
        IGameRepository gameRepository,
        WalletService walletService,
        OrderService orderService,
        ITransactionManager transaction)
    {
        _packageService = packageService;
        _gameRepository = gameRepository;
        _walletService = walletService;
        _orderService = orderService;
        _transaction = transaction;
    }

    public async Task<CreateOrderResponse> PurchaseOrderAsync(UserContext actor, PurchaseOrderRequest request)
    {
        return await _transaction.ExecuteAsync(async () =>
        {
            var gameAccountInfo = InputTextNormalizer.Required(request.GameAccountInfo, ErrorCode.BadRequest);
            var package = await _packageService.GetActivePackageByIdOrThrowAsync(request.GamePackageId);
            var wallet = await _walletService.LockByUserIdOrThrowAsync(actor.UserId);
            var packagePrice = package.SalePrice;

            _walletService.EnsureSufficientBalance(wallet, packagePrice);
            await _packageService.ReservePackageAsync(package.Id);

            var order = Order.Create(
                actor.UserId,
                package.Id,
                packagePrice,
                package.Name,
                gameAccountInfo);
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

            var package = await _packageService.GetPackageByIdOrThrowAsync(order.GamePackageId);
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
            var package = await _packageService.GetPackageByIdOrThrowAsync(order.GamePackageId);
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

            await _packageService.RestorePackageAsync(order.GamePackageId);
            var package = await _packageService.GetPackageByIdOrThrowAsync(order.GamePackageId);

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
