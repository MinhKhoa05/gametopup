using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.DAL.Entities;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ConcurrencyTests;

[Collection("Integration")]
public sealed class OrderConcurrencyTests : BaseIntegrationTest
{
    public OrderConcurrencyTests(CustomWebApplicationFactory factory)
        : base(factory)
    {
    }

    [Fact]
    public async Task ConcurrentPurchase_ShouldAllowOnlyOneSuccess_WhenStockIsOne()
    {
        // Arrange
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedPackageAsync(game.Id, p =>
        {
            p.SalePrice = 100_000m;
            p.AvailableSlots = 1;
        });

        var userA = await Factory.SeedUserAsync();
        var userB = await Factory.SeedUserAsync();

        await Factory.SeedWalletAsync(userA.Id, w =>
        {
            w.Balance = 100_000m;
        });

        await Factory.SeedWalletAsync(userB.Id, w =>
        {
            w.Balance = 100_000m;
        });

        using var clientA = CreateHeaderAuthenticatedClient(userA);
        using var clientB = CreateHeaderAuthenticatedClient(userB);

        // Act
        var taskA = clientA.PostJsonAsync(
            "/api/orders",
            new PurchaseOrderRequest
            {
                PackageId = package.Id,
                GameAccountInfo = "UID-A"
            });

        var taskB = clientB.PostJsonAsync(
            "/api/orders",
            new PurchaseOrderRequest
            {
                PackageId = package.Id,
                GameAccountInfo = "UID-B"
            });

        var responses = await Task.WhenAll(taskA, taskB);
        responses.Count(x => x.IsSuccessStatusCode).Should().Be(1);

        // Assert
        var updatedPackage = await Factory.GetPackageAsync(package.Id);
        updatedPackage.Should().NotBeNull();
        updatedPackage!.AvailableSlots.Should().Be(0);

        var userAOrders = await Factory.GetOrdersByUserAsync(userA.Id);
        var userBOrders = await Factory.GetOrdersByUserAsync(userB.Id);

        var totalOrders = userAOrders.Count + userBOrders.Count;
        totalOrders.Should().Be(1);

        var walletA = await Factory.GetWalletAsync(userA.Id);
        var walletB = await Factory.GetWalletAsync(userB.Id);

        var deductedWallets = new[]
        {
            walletA!.Balance,
            walletB!.Balance
        };

        deductedWallets.Should().Contain(0m);
        deductedWallets.Should().Contain(100_000m);
    }

    [Fact]
    public async Task ConcurrentPickOrder_ShouldAssignToOnlyOneAdmin()
    {
        // Arrange
        var orderScenario = await Factory.SeedOrderScenarioAsync();
        var orderId = orderScenario.Order.Id;

        var adminA = await Factory.SeedAdminAsync();
        var adminB = await Factory.SeedAdminAsync();

        using var clientA = CreateHeaderAuthenticatedClient(adminA);
        using var clientB = CreateHeaderAuthenticatedClient(adminB);

        // Act
        var taskA = clientA.PostAsync($"/api/admin/orders/{orderId}/pick", null);
        var taskB = clientB.PostAsync($"/api/admin/orders/{orderId}/pick", null);

        var responses = await Task.WhenAll(taskA, taskB);
        responses.Count(x => x.IsSuccessStatusCode).Should().Be(1);

        // Assert
        var updatedOrder = await Factory.GetOrderAsync(orderId);
        updatedOrder.Should().NotBeNull();

        updatedOrder!.Status
            .Should()
            .Be(OrderStatus.Processing);

        updatedOrder.AssignedTo
            .Should()
            .BeOneOf(adminA.Id, adminB.Id);
    }

    [Fact]
    public async Task ConcurrentCancelOrder_ShouldRefundAndRestoreStockOnlyOnce()
    {
        // Arrange
        const decimal packagePrice = 100_000m;
        var user = await Factory.SeedUserAsync();

        // Simulate a purchased order:
        // wallet already deducted and stock already reduced
        await Factory.SeedWalletAsync(user.Id, w =>
        {
            w.Balance = 0m;
        });

        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedPackageAsync(game.Id, p =>
        {
            p.SalePrice = packagePrice;
            p.AvailableSlots = 4;
        });

        var order = await Factory.SeedOrderAsync(user.Id, package.Id, o =>
        {
            o.PackagePrice = packagePrice;
            o.Status = OrderStatus.Pending;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        // Cancel Order Concurrently
        var taskA = client.PostAsync($"/api/orders/{order.Id}/cancel", null);
        var taskB = client.PostAsync($"/api/orders/{order.Id}/cancel", null);

        var responses = await Task.WhenAll(taskA, taskB);

        // Cancel operation is idempotent
        responses.Count(x => x.IsSuccessStatusCode).Should().Be(2);

        // Verify Order Cancelled
        var updatedOrder = await Factory.GetOrderAsync(order.Id);
        updatedOrder.Should().NotBeNull();
        updatedOrder!.Status.Should().Be(OrderStatus.Cancelled);

        // Verify Wallet Refunded Once
        var wallet = await Factory.GetWalletAsync(user.Id);
        wallet.Should().NotBeNull();
        wallet!.Balance.Should().Be(packagePrice);

        // Verify Stock Restored Once
        var updatedPackage = await Factory.GetPackageAsync(package.Id);
        updatedPackage.Should().NotBeNull();
        updatedPackage!.AvailableSlots.Should().Be(5);

        // Verify Refund Transaction Created Once
        var transactions = await Factory.GetWalletTransactionsAsync(user.Id);
        transactions.Count(x => x.Amount == packagePrice).Should().Be(1);

        // Verify Cancel History Created Once
        var histories = await Factory.GetOrderHistoriesAsync(order.Id);
        histories.Count(x => x.ToStatus == OrderStatus.Cancelled).Should().Be(1);
    }
}
