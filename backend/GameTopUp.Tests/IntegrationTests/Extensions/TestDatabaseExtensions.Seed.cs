using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using WalletDepositEntity = GameTopUp.DAL.Entities.WalletDeposit;
using WalletEntity = GameTopUp.DAL.Entities.Wallet;
using WalletTransactionEntity = GameTopUp.DAL.Entities.WalletTransaction;
using WalletTransactionType = GameTopUp.DAL.Entities.WalletTransactionType;

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
        var now = DateTimeOffset.UtcNow;
        var user = new User
        {
            DisplayName = $"Test User {unique}",
            Email = $"user-{unique}@test.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(DefaultUserPassword),
            Role = role,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

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
        var now = DateTimeOffset.UtcNow;
        var wallet = new WalletEntity
        {
            UserId = userId,
            Balance = 0m,
            CreatedAt = now,
            UpdatedAt = now
        };
        customize?.Invoke(wallet);

        return factory.InsertSeedAsync(wallet, (x, id) => x.Id = id);
    }

    public static Task<Game> SeedGameAsync(
        this CustomWebApplicationFactory factory,
        Action<Game>? customize = null)
    {
        var unique = UniqueCode();
        var now = DateTimeOffset.UtcNow;
        var game = new Game
        {
            Name = $"Test Game {unique}",
            ImageUrl = string.Empty,
            ImageRelativePath = null,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        customize?.Invoke(game);

        return factory.InsertSeedAsync(game, (x, id) => x.Id = id);
    }

    public static Task<GamePackage> SeedGamePackageAsync(
        this CustomWebApplicationFactory factory,
        long gameId,
        Action<GamePackage>? customize = null)
    {
        var now = DateTimeOffset.UtcNow;
        var package = new GamePackage
        {
            Name = $"Test Package {UniqueCode()}",
            GameId = gameId,
            SalePrice = 100m,
            OriginalPrice = 100m,
            ImportPrice = 100m,
            AvailableSlots = 0,
            ImageUrl = string.Empty,
            ImageRelativePath = null,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        customize?.Invoke(package);

        return factory.InsertSeedAsync(package, (x, id) => x.Id = id);
    }

    public static Task<WalletDepositEntity> SeedWalletDepositAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        Action<WalletDepositEntity>? customize = null)
    {
        var requestCode = $"DEP-{UniqueCode(12)}".ToUpperInvariant();
        var now = DateTimeOffset.UtcNow;
        var request = new WalletDepositEntity
        {
            UserId = userId,
            Amount = 100m,
            Code = requestCode,
            TransferContent = $"Deposit content {requestCode}",
            Status = WalletDepositStatus.Pending,
            CreatedAt = now,
            UpdatedAt = now
        };

        customize?.Invoke(request);

        return factory.InsertSeedAsync(request, (x, id) => x.Id = id);
    }

    public static Task<RefreshToken> SeedRefreshTokenAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        Action<RefreshToken>? customize = null)
    {
        var now = DateTimeOffset.UtcNow;
        var refreshToken = new RefreshToken
        {
            UserId = userId,
            TokenHash = UniqueCode(32),
            CreatedAt = now,
            ExpiresAt = now.AddDays(7)
        };
        customize?.Invoke(refreshToken);

        return factory.InsertSeedAsync(refreshToken, (x, id) => x.Id = id);
    }

    public static Task<WalletTransactionEntity> SeedWalletTransactionAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        Action<WalletTransactionEntity>? customize = null)
    {
        var transaction = new WalletTransactionEntity
        {
            UserId = userId,
            Amount = 100m,
            BalanceBefore = 0m,
            BalanceAfter = 100m,
            Type = WalletTransactionType.Deposit,
            ReferenceId = null,
            CreatedAt = DateTimeOffset.UtcNow
        };

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
