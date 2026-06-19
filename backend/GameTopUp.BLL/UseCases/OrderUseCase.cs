using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;
using GameTopUp.BLL.Services.Games;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Orders;
using GameTopUp.DAL.Interfaces.Wallets;

namespace GameTopUp.BLL.UseCases;

public sealed class OrderUseCase
{
    private readonly GamePackageService _packageService;
    private readonly WalletService _walletService;
    private readonly OrderService _orderService;
    private readonly IOrderRepository _orderRepository;
    private readonly IOrderHistoryRepository _orderHistoryRepository;
    private readonly IWalletRepository _walletRepository;
    private readonly IWalletTransactionRepository _walletTransactionRepository;
    private readonly DatabaseContext _database;

    public OrderUseCase(
        GamePackageService packageService,
        WalletService walletService,
        OrderService orderService,
        IOrderRepository orderRepository,
        IOrderHistoryRepository orderHistoryRepository,
        IWalletRepository walletRepository,
        IWalletTransactionRepository walletTransactionRepository,
        DatabaseContext database)
    {
        _packageService = packageService;
        _walletService = walletService;
        _orderService = orderService;
        _orderRepository = orderRepository;
        _orderHistoryRepository = orderHistoryRepository;
        _walletRepository = walletRepository;
        _walletTransactionRepository = walletTransactionRepository;
        _database = database;
    }

    public async Task<Order> PurchaseOrderAsync(UserContext actor, PurchaseOrderRequestDTO request)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var gameAccountInfo = request.GameAccountInfo.Trim();
            if (string.IsNullOrWhiteSpace(gameAccountInfo))
            {
                throw new BusinessException(ErrorCode.BadRequest);
            }

            var package = await _packageService.GetActivePackageByIdOrThrowAsync(request.GamePackageId);

            var wallet = await GetWalletByUserIdForUpdateOrThrowAsync(actor.UserId);

            var order = Order.Create(actor.UserId, package.Id, package.SalePrice, gameAccountInfo);
            var orderId = await _orderRepository.CreateAsync(order);
            order.Id = orderId;

            var walletTransaction = _walletService.ChargeOrder(wallet, orderId, package.SalePrice);

            await _packageService.ReservePackageAsync(package.Id);

            var history = OrderHistory.Create(
                order.Id,
                OrderStatus.Pending,
                OrderStatus.Pending,
                actor.UserId,
                "Order created in pending state.");

            await _orderHistoryRepository.CreateAsync(history);
            await PersistWalletChangeAsync(wallet, walletTransaction);

            return order;
        });
    }

    public async Task<Order> PickOrderAsync(long orderId, UserContext actor)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var order = await GetOrderByIdForUpdateOrThrowAsync(orderId);

            if (order.Status == OrderStatus.Processing && order.AssignedTo == actor.UserId)
            {
                return order;
            }

            var history = _orderService.PickOrder(order, actor);
            await PersistOrderTransitionAsync(order, history);

            return order;
        });
    }

    public async Task<Order> CompleteOrderAsync(long orderId, UserContext actor)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var order = await GetOrderByIdForUpdateOrThrowAsync(orderId);

            if (order.Status == OrderStatus.Completed)
            {
                return order;
            }

            var history = _orderService.CompleteOrder(order, actor);
            await PersistOrderTransitionAsync(order, history);

            return order;
        });
    }

    public async Task<Order> CancelOrderAsync(long orderId, UserContext actor, string? reason = null)
    {
        return await _database.ExecuteInTransactionAsync(async () =>
        {
            var order = await GetOrderByIdForUpdateOrThrowAsync(orderId);

            if (order.Status == OrderStatus.Cancelled)
            {
                return order;
            }

            var history = _orderService.CancelOrder(order, actor, reason);
            await PersistOrderTransitionAsync(order, history);
            await _packageService.RestorePackageAsync(order.GamePackageId);
            var wallet = await GetWalletByUserIdForUpdateOrThrowAsync(order.UserId);
            var walletTransaction = _walletService.RefundOrder(wallet, order.Id, order.Total, reason);
            await PersistWalletChangeAsync(wallet, walletTransaction);

            return order;
        });
    }

    private async Task<Order> GetOrderByIdForUpdateOrThrowAsync(long orderId)
    {
        return await _orderRepository.GetWithLockByIdAsync(orderId)
            ?? throw new NotFoundException(ErrorCode.OrderNotFound, $"Order #{orderId} was not found.");
    }

    private async Task<Wallet> GetWalletByUserIdForUpdateOrThrowAsync(long userId)
    {
        return await _walletRepository.GetWithLockByUserIdAsync(userId)
            ?? throw new NotFoundException(ErrorCode.WalletNotFound);
    }

    private async Task PersistWalletChangeAsync(Wallet wallet, WalletTransaction transaction)
    {
        await _walletRepository.UpdateBalanceAsync(wallet.Id, wallet.Balance);
        await _walletTransactionRepository.CreateAsync(transaction);
    }

    private async Task PersistOrderTransitionAsync(Order order, OrderHistory history)
    {
        await _orderRepository.UpdateAsync(order);
        await _orderHistoryRepository.CreateAsync(history);
    }
}
