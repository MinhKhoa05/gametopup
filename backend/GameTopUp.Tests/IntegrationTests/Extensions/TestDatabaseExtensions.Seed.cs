using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Auth;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using WalletDepositEntity = GameTopUp.DAL.Entities.Wallets.WalletDeposit;
using WalletEntity = GameTopUp.DAL.Entities.Wallets.Wallet;
using WalletTransactionEntity = GameTopUp.DAL.Entities.Wallets.WalletTransaction;
using WalletTransactionType = GameTopUp.DAL.Entities.Wallets.WalletTransactionType;

namespace GameTopUp.Tests.IntegrationTests.Extensions;

public static partial class TestDatabaseExtensions
{
    public const string DefaultUserPassword = "Password123!";

    public static string UniqueCode(int length = 8) => Guid.NewGuid().ToString("N")[..length];
    public static string UniqueEmail(string prefix = "user") => $"{prefix}-{UniqueCode()}@test.local";

    public static Task<User> SeedUserAsync(
        this CustomWebApplicationFactory factory,
        UserRole role = UserRole.Member,
        Action<User>? customize = null)
    {
        var unique = UniqueCode(10);
        var user = User.Create(
            $"Test User {unique}",
            $"user-{unique}@test.local",
            BCrypt.Net.BCrypt.HashPassword(DefaultUserPassword),
            role);

        customize?.Invoke(user);

        return factory.InsertSeedAsync(user, (x, id) => x.Id = id);
    }

    public static Task<User> SeedAdminAsync(
        this CustomWebApplicationFactory factory,
        Action<User>? customize = null) =>
        factory.SeedUserAsync(UserRole.Admin, customize: customize);

    public static Task<WalletEntity> SeedWalletAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        Action<WalletEntity>? customize = null)
    {
        var wallet = WalletEntity.CreateForUser(userId, 0m);
        customize?.Invoke(wallet);

        return factory.InsertSeedAsync(wallet, (x, id) => x.Id = id);
    }

    public static Task<Game> SeedGameAsync(
        this CustomWebApplicationFactory factory,
        Action<Game>? customize = null)
    {
        var unique = UniqueCode();
        var game = Game.Create($"Test Game {unique}");

        customize?.Invoke(game);

        return factory.InsertSeedAsync(game, (x, id) => x.Id = id);
    }

    public static Task<GamePackage> SeedGamePackageAsync(
        this CustomWebApplicationFactory factory,
        long gameId,
        Action<GamePackage>? customize = null)
    {
        var package = GamePackage.Create(
            $"Test Package {UniqueCode()}",
            gameId,
            100m,
            100m,
            100m,
            0);

        customize?.Invoke(package);

        return factory.InsertSeedAsync(package, (x, id) => x.Id = id);
    }

    public static Task<Order> SeedOrderAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        long packageId,
        Action<Order>? customize = null)
    {
        var unique = UniqueCode();
        var order = Order.Create(
            userId,
            packageId,
            100m,
            $"Test Package {unique}",
            $"account-{unique}");

        customize?.Invoke(order);

        return factory.InsertSeedAsync(order, (x, id) => x.Id = id);
    }

    public static Task<WalletDepositEntity> SeedWalletDepositAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        Action<WalletDepositEntity>? customize = null)
    {
        var requestCode = $"DEP-{UniqueCode(12)}".ToUpperInvariant();
        var request = WalletDepositEntity.Create(
            userId,
            100m,
            requestCode,
            $"Deposit content {requestCode}");

        customize?.Invoke(request);

        return factory.InsertSeedAsync(request, (x, id) => x.Id = id);
    }

    public static Task<RefreshToken> SeedRefreshTokenAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        Action<RefreshToken>? customize = null)
    {
        var refreshToken = RefreshToken.Create(userId, UniqueCode(32), TimeSpan.FromDays(7));
        customize?.Invoke(refreshToken);

        return factory.InsertSeedAsync(refreshToken, (x, id) => x.Id = id);
    }

    public static Task<WalletTransactionEntity> SeedWalletTransactionAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        Action<WalletTransactionEntity>? customize = null)
    {
        var transaction = WalletTransactionEntity.Create(
            userId,
            100m,
            0m,
            100m,
            WalletTransactionType.Deposit,
            null);

        customize?.Invoke(transaction);

        return factory.InsertSeedAsync(transaction, (x, id) => x.Id = id);
    }

    private static Task<T> InsertSeedAsync<T>(
        this CustomWebApplicationFactory factory,
        T entity,
        Action<T, long> setId)
        where T : class
    {
        return factory.WithDbAsync(async db =>
        {
            var id = await db.InsertAsync(entity);
            if (id <= 0)
            {
                throw new InvalidOperationException($"{typeof(T).Name} insert returned no id.");
            }

            setId(entity, id);
            return entity;
        });
    }

    private static async Task<T> WithDbAsync<T>(
        this CustomWebApplicationFactory factory,
        Func<DatabaseContext, Task<T>> action)
    {
        using var scope = factory.Services.CreateScope();
        var database = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
        return await action(database);
    }
}
