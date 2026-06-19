using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Auth;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using Microsoft.Extensions.DependencyInjection;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using WalletDepositStatus = GameTopUp.DAL.Entities.Wallets.WalletDepositStatus;
using WalletEntity = GameTopUp.DAL.Entities.Wallets.Wallet;
using WalletDepositEntity = GameTopUp.DAL.Entities.Wallets.WalletDeposit;
using WalletTransactionEntity = GameTopUp.DAL.Entities.Wallets.WalletTransaction;

namespace GameTopUp.Tests.IntegrationTests.Support;

public static partial class TestDatabaseExtensions
{
    public static Task<User?> GetUserAsync(this CustomWebApplicationFactory factory, long userId) =>
        factory.WithDbAsync(db => db.GetByIdAsync<User>(userId));

    public static Task<WalletEntity?> GetWalletAsync(this CustomWebApplicationFactory factory, long userId) =>
        factory.WithDbAsync(db => db.QueryFirstAsync<WalletEntity>("SELECT * FROM wallets WHERE user_id = @UserId", new { UserId = userId }));

    public static Task<Game?> GetGameAsync(this CustomWebApplicationFactory factory, long gameId) =>
        factory.WithDbAsync(db => db.GetByIdAsync<Game>(gameId));

    public static Task<GamePackage?> GetGamePackageAsync(this CustomWebApplicationFactory factory, long packageId) =>
        factory.WithDbAsync(db => db.GetByIdAsync<GamePackage>(packageId));

    public static Task<Order?> GetOrderAsync(this CustomWebApplicationFactory factory, long orderId) =>
        factory.WithDbAsync(db => db.GetByIdAsync<Order>(orderId));

    public static Task<WalletDepositEntity?> GetDepositRequestAsync(this CustomWebApplicationFactory factory, long requestId) =>
        factory.WithDbAsync(db => db.GetByIdAsync<WalletDepositEntity>(requestId));

    public static Task<List<WalletTransactionEntity>> GetWalletTransactionsAsync(this CustomWebApplicationFactory factory, long userId) =>
        factory.WithDbAsync(db => db.QueryAsync<WalletTransactionEntity>("SELECT * FROM wallet_transactions WHERE user_id = @UserId ORDER BY created_at DESC", new { UserId = userId }));

    public static Task<List<Order>> GetOrdersAsync(this CustomWebApplicationFactory factory, OrderStatus? status = null) =>
        factory.WithDbAsync(db => db.QueryAsync<Order>("SELECT * FROM orders WHERE (@Status IS NULL OR status = @Status) ORDER BY created_at DESC", new { Status = status }));

    public static Task<List<Order>> GetOrdersByUserAsync(this CustomWebApplicationFactory factory, long userId, OrderStatus? status = null) =>
        factory.WithDbAsync(db =>
            db.QueryAsync<Order>(
                "SELECT * FROM orders WHERE user_id = @UserId AND (@Status IS NULL OR status = @Status) ORDER BY created_at DESC",
                new { UserId = userId, Status = status }));

    public static Task<List<OrderHistory>> GetOrderHistoriesAsync(this CustomWebApplicationFactory factory, long orderId) =>
        factory.WithDbAsync(db => db.QueryAsync<OrderHistory>("SELECT * FROM order_history WHERE order_id = @OrderId ORDER BY created_at DESC", new { OrderId = orderId }));

    public static Task<int> GetOrderHistoryCountAsync(this CustomWebApplicationFactory factory, long orderId) =>
        factory.WithDbAsync(db => db.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM order_history WHERE order_id = @OrderId", new { OrderId = orderId }));

    public static Task<List<Game>> GetGamesAsync(this CustomWebApplicationFactory factory) =>
        factory.WithDbAsync(db => db.QueryAsync<Game>("SELECT * FROM games ORDER BY created_at DESC"));

    public static Task<List<GamePackage>> GetGamePackagesAsync(this CustomWebApplicationFactory factory) =>
        factory.WithDbAsync(db => db.QueryAsync<GamePackage>("SELECT * FROM game_packages ORDER BY created_at DESC"));

    public static Task<List<GamePackage>> GetGamePackagesByGameAsync(this CustomWebApplicationFactory factory, long gameId) =>
        factory.WithDbAsync(db => db.QueryAsync<GamePackage>("SELECT * FROM game_packages WHERE game_id = @GameId AND is_active = 1 ORDER BY created_at DESC", new { GameId = gameId }));

    public static Task<List<WalletDepositEntity>> GetDepositRequestsAsync(this CustomWebApplicationFactory factory, WalletDepositStatus? status = null) =>
        factory.WithDbAsync(db =>
            db.QueryAsync<WalletDepositEntity>(
                "SELECT * FROM wallet_deposits WHERE (@Status IS NULL OR status = @Status) ORDER BY created_at DESC",
                new { Status = status }));

    public static Task<List<WalletDepositEntity>> GetDepositRequestsByUserAsync(this CustomWebApplicationFactory factory, long userId, WalletDepositStatus? status = null) =>
        factory.WithDbAsync(db =>
            db.QueryAsync<WalletDepositEntity>(
                "SELECT * FROM wallet_deposits WHERE user_id = @UserId AND (@Status IS NULL OR status = @Status) ORDER BY created_at DESC",
                new { UserId = userId, Status = status }));

    public static Task<RefreshToken?> GetRefreshTokenAsync(this CustomWebApplicationFactory factory, string tokenHash) =>
        factory.WithDbAsync(db => db.QueryFirstAsync<RefreshToken>("SELECT * FROM refresh_tokens WHERE token_hash = @TokenHash", new { TokenHash = tokenHash }));
}
