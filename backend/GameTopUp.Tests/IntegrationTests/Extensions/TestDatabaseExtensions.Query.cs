using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Auth;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using WalletEntity = GameTopUp.DAL.Entities.Wallets.Wallet;
using WalletDepositEntity = GameTopUp.DAL.Entities.Wallets.WalletDeposit;
using WalletTransactionEntity = GameTopUp.DAL.Entities.Wallets.WalletTransaction;

namespace GameTopUp.Tests.IntegrationTests.Extensions;

public static partial class TestDatabaseExtensions
{
    public static Task<User?> GetUserAsync(
        this CustomWebApplicationFactory factory,
        long userId)
    {
        return factory.WithDbAsync(db =>
            db.GetByIdAsync<User>(userId));
    }

    public static Task<WalletEntity?> GetWalletAsync(
        this CustomWebApplicationFactory factory,
        long userId)
    {
        return factory.WithDbAsync(db =>
            db.QueryFirstOrDefaultAsync<WalletEntity>(
                "SELECT * FROM wallets WHERE user_id = @UserId",
                new { UserId = userId }));
    }

    public static Task<Game?> GetGameAsync(
        this CustomWebApplicationFactory factory,
        long gameId)
    {
        return factory.WithDbAsync(db =>
            db.GetByIdAsync<Game>(gameId));
    }

    public static Task<GamePackage?> GetGamePackageAsync(
        this CustomWebApplicationFactory factory,
        long packageId)
    {
        return factory.WithDbAsync(db =>
            db.GetByIdAsync<GamePackage>(packageId));
    }

    public static Task<Order?> GetOrderAsync(
        this CustomWebApplicationFactory factory,
        long orderId)
    {
        return factory.WithDbAsync(db =>
            db.GetByIdAsync<Order>(orderId));
    }

    public static Task<List<OrderHistory>> GetOrderHistoriesAsync(
        this CustomWebApplicationFactory factory,
        long orderId)
    {
        return factory.WithDbAsync(db =>
            db.QueryAsync<OrderHistory>(
                """
                SELECT *
                FROM order_history
                WHERE order_id = @OrderId
                ORDER BY created_at DESC
                """,
                new { OrderId = orderId }));
    }

    public static Task<WalletDepositEntity?> GetDepositAsync(
        this CustomWebApplicationFactory factory,
        long depositId)
    {
        return factory.WithDbAsync(db =>
            db.GetByIdAsync<WalletDepositEntity>(depositId));
    }

    public static Task<List<WalletTransactionEntity>> GetWalletTransactionsAsync(
        this CustomWebApplicationFactory factory,
        long userId)
    {
        return factory.WithDbAsync(db =>
            db.QueryAsync<WalletTransactionEntity>(
                """
                SELECT *
                FROM wallet_transactions
                WHERE user_id = @UserId
                ORDER BY created_at DESC
                """,
                new { UserId = userId }));
    }

    public static Task<RefreshToken?> GetRefreshTokenAsync(
        this CustomWebApplicationFactory factory,
        string tokenHash)
    {
        return factory.WithDbAsync(db =>
            db.QueryFirstOrDefaultAsync<RefreshToken>(
                """
                SELECT *
                FROM refresh_tokens
                WHERE token_hash = @TokenHash
                """,
                new { TokenHash = tokenHash }));
    }
}