using GameTopUp.Tests.IntegrationTests.Infrastructure;
using GameTopUp.DAL.Entities;

namespace GameTopUp.Tests.IntegrationTests.Extensions;

public static partial class TestDatabaseExtensions
{
    public sealed record OrderScenario(User User, Game Game, GamePackage Package, Order Order);

    public static Task<Order> SeedOrderAsync(
        this CustomWebApplicationFactory factory,
        long userId,
        long packageId,
        Action<Order>? customize = null)
    {
        var unique = UniqueCode();
        var now = DateTimeOffset.UtcNow;
        var order = new Order
        {
            UserId = userId,
            GamePackageId = packageId,
            PackagePrice = 100m,
            PackageName = $"Test Package {unique}",
            PackageCost = 0m,
            GameAccountInfo = $"account-{unique}",
            Status = OrderStatus.Pending,
            CreatedAt = now,
            UpdatedAt = now
        };

        customize?.Invoke(order);

        return factory.InsertSeedAsync(order, (x, id) => x.Id = id);
    }

    public static Task<OrderHistory> SeedOrderHistoryAsync(
        this CustomWebApplicationFactory factory,
        long orderId,
        long actionBy,
        Action<OrderHistory>? customize = null)
    {
        var history = new OrderHistory
        {
            OrderId = orderId,
            FromStatus = OrderStatus.Pending,
            ToStatus = OrderStatus.Pending,
            ActionBy = actionBy,
            CreatedAt = DateTimeOffset.UtcNow
        };

        customize?.Invoke(history);

        return factory.InsertSeedAsync(history, (x, id) => x.Id = id);
    }

    public static async Task<OrderScenario> SeedOrderScenarioAsync(
        this CustomWebApplicationFactory factory,
        Action<Order>? customizeOrder = null)
    {
        var user = await factory.SeedUserAsync();

        var game = await factory.SeedGameAsync();

        var package = await factory.SeedGamePackageAsync(game.Id);

        var order = await factory.SeedOrderAsync(user.Id, package.Id, order =>
        {
            order.PackagePrice = package.SalePrice;
            customizeOrder?.Invoke(order);
        });

        return new OrderScenario(user, game, package, order);
    }
}
