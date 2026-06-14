using BCrypt.Net;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Auth;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using Microsoft.Extensions.DependencyInjection;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using WalletTransactionType = GameTopUp.DAL.Entities.Wallets.WalletTransactionType;
using WalletDepositRequestStatus = GameTopUp.DAL.Entities.Wallets.WalletDepositRequestStatus;
using WalletEntity = GameTopUp.DAL.Entities.Wallets.Wallet;
using WalletDepositRequestEntity = GameTopUp.DAL.Entities.Wallets.WalletDepositRequest;
using WalletTransactionEntity = GameTopUp.DAL.Entities.Wallets.WalletTransaction;

namespace GameTopUp.Tests.IntegrationTests.Support;

public static partial class TestDatabaseExtensions
{
    private const string DefaultPassword = "Password123!";

    public static string DefaultUserPassword => DefaultPassword;
    public static string UniqueCode(int length = 8) => Guid.NewGuid().ToString("N")[..length];

    public static Task<User> SeedUserAsync(
        this CustomWebApplicationFactory factory,
        UserRole role = UserRole.Member,
        string? email = null,
        bool isActive = true,
        Action<User>? customize = null)
    {
        var unique = UniqueCode(10);
        var user = User.Create(
            $"Test User {unique}",
            email ?? $"user-{unique}@test.local",
            Hash(DefaultPassword),
            role);

        user.IsActive = isActive;
        customize?.Invoke(user);

        return factory.WithDbAsync(async db =>
        {
            var id = await db.InsertAsync<User, long>(user);
            if (id == default)
            {
                throw new InvalidOperationException("User insert returned no id.");
            }

            user.Id = id;
            return user;
        });
    }

    public static Task<User> SeedAdminAsync(this CustomWebApplicationFactory factory, Action<User>? customize = null) =>
        factory.SeedUserAsync(UserRole.Admin, customize: customize);

    public static Task<WalletEntity> SeedWalletAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        decimal balance = 0m,
        Action<WalletEntity>? customize = null)
    {
        var wallet = WalletEntity.CreateForUser(userId, balance);
        customize?.Invoke(wallet);

        return factory.WithDbAsync(async db =>
        {
            var id = await db.InsertAsync<WalletEntity, long>(wallet);
            if (id == default)
            {
                throw new InvalidOperationException("Wallet insert returned no id.");
            }

            wallet.Id = id;
            return wallet;
        });
    }

    public static Task<Game> SeedGameAsync(
        this CustomWebApplicationFactory factory,
        string? name = null,
        bool isActive = true,
        Action<Game>? customize = null)
    {
        var unique = UniqueCode();
        var game = Game.Create(name ?? $"Test Game {unique}");

        game.IsActive = isActive;
        customize?.Invoke(game);

        return factory.WithDbAsync(async db =>
        {
            var id = await db.InsertAsync<Game, long>(game);
            if (id == default)
            {
                throw new InvalidOperationException("Game insert returned no id.");
            }

            game.Id = id;
            return game;
        });
    }

    public static Task<GamePackage> SeedGamePackageAsync(
        this CustomWebApplicationFactory factory,
        long gameId,
        decimal salePrice = 100m,
        int stockQuantity = 0,
        bool isActive = true,
        Action<GamePackage>? customize = null)
    {
        var package = GamePackage.Create(
            $"Test Package {UniqueCode()}",
            gameId,
            salePrice,
            salePrice,
            salePrice,
            stockQuantity);

        package.IsActive = isActive;
        customize?.Invoke(package);

        return factory.WithDbAsync(async db =>
        {
            var id = await db.InsertAsync<GamePackage, long>(package);
            if (id == default)
            {
                throw new InvalidOperationException("GamePackage insert returned no id.");
            }

            package.Id = id;
            return package;
        });
    }

    public static Task<Order> SeedOrderAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        long packageId,
        string? gameAccountInfo = null,
        OrderStatus status = OrderStatus.Pending,
        Action<Order>? customize = null)
    {
        var unique = UniqueCode();
        var order = Order.Create(
            userId,
            packageId,
            100m,
            gameAccountInfo ?? $"account-{unique}");

        order.Status = status;
        customize?.Invoke(order);

        return factory.WithDbAsync(async db =>
        {
            var id = await db.InsertAsync<Order, long>(order);
            if (id == default)
            {
                throw new InvalidOperationException("Order insert returned no id.");
            }

            order.Id = id;
            return order;
        });
    }

    public static Task<WalletDepositRequestEntity> SeedDepositRequestAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        decimal amount = 100m,
        WalletDepositRequestStatus status = WalletDepositRequestStatus.Pending,
        Action<WalletDepositRequestEntity>? customize = null)
    {
        var requestCode = $"DEP-{UniqueCode(12)}".ToUpperInvariant();
        var request = WalletDepositRequestEntity.Create(
            userId,
            amount,
            requestCode,
            $"Deposit content {requestCode}");

        request.Status = status;
        customize?.Invoke(request);

        return factory.WithDbAsync(async db =>
        {
            var id = await db.InsertAsync<WalletDepositRequestEntity, long>(request);
            if (id == default)
            {
                throw new InvalidOperationException("Deposit request insert returned no id.");
            }

            request.Id = id;
            return request;
        });
    }

    public static Task<RefreshToken> SeedRefreshTokenAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        string tokenHash,
        TimeSpan? lifetime = null)
    {
        var refreshToken = RefreshToken.Create(userId, tokenHash, lifetime ?? TimeSpan.FromDays(7));

        return factory.WithDbAsync(async db =>
        {
            var id = await db.InsertAsync<RefreshToken, long>(refreshToken);
            if (id == default)
            {
                throw new InvalidOperationException("Refresh token insert returned no id.");
            }

            refreshToken.Id = id;
            return refreshToken;
        });
    }

    public static Task<WalletTransactionEntity> SeedWalletTransactionAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        decimal amount,
        decimal balanceBefore,
        decimal balanceAfter,
        WalletTransactionType type = WalletTransactionType.Deposit,
        long? orderId = null,
        Action<WalletTransactionEntity>? customize = null)
    {
        var transaction = WalletTransactionEntity.Create(
            userId,
            amount,
            balanceBefore,
            balanceAfter,
            type,
            $"Test transaction {type}",
            orderId);

        customize?.Invoke(transaction);

        return factory.WithDbAsync(async db =>
        {
            var id = await db.InsertAsync<WalletTransactionEntity, long>(transaction);
            if (id == default)
            {
                throw new InvalidOperationException("Wallet transaction insert returned no id.");
            }

            transaction.Id = id;
            return transaction;
        });
    }

    private static async Task<T> WithDbAsync<T>(this CustomWebApplicationFactory factory, Func<DatabaseContext, Task<T>> action)
    {
        using var scope = factory.Services.CreateScope();
        var database = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
        return await action(database);
    }

    private static string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);
}
