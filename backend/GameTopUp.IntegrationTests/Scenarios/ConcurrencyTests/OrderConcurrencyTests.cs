using System.Net;
using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.DAL.Entities;
using GameTopUp.IntegrationTests.Extensions;
using GameTopUp.IntegrationTests.Infrastructure;

namespace GameTopUp.IntegrationTests.Scenarios.ConcurrencyTests;

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

    [Fact]
    public async Task ConcurrentPickAndUserCancelOrder_ShouldAllowOnlyOneFinalTransition()
    {
        // Arrange
        const decimal packagePrice = 100_000m;
        var user = await Factory.SeedUserAsync();

        await Factory.SeedWalletAsync(user.Id, wallet =>
        {
            wallet.Balance = 0m;
        });

        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedPackageAsync(game.Id, p =>
        {
            p.ImportPrice = 80_000m;
            p.SalePrice = packagePrice;
            p.AvailableSlots = 2;
        });

        var order = await Factory.SeedOrderAsync(user.Id, package.Id, o =>
        {
            o.PackagePrice = packagePrice;
            o.Status = OrderStatus.Pending;
        });

        var admin = await Factory.SeedAdminAsync();

        using var userClient = CreateHeaderAuthenticatedClient(user);
        using var adminClient = CreateHeaderAuthenticatedClient(admin);

        // Act
        var pickTask = adminClient.PostAsync($"/api/admin/orders/{order.Id}/pick", null);
        var cancelTask = userClient.PostAsync($"/api/orders/{order.Id}/cancel", null);

        var pickResponse = await pickTask;
        var cancelResponse = await cancelTask;

        // Assert
        new[] { pickResponse, cancelResponse }
            .Count(response => response.IsSuccessStatusCode)
            .Should()
            .Be(1);

        new[] { pickResponse, cancelResponse }
            .Count(response => response.StatusCode == HttpStatusCode.BadRequest)
            .Should()
            .Be(1);

        var updatedOrder = await Factory.GetOrderAsync(order.Id);
        updatedOrder!.Status.Should().BeOneOf(OrderStatus.Processing, OrderStatus.Cancelled);

        var wallet = await Factory.GetWalletAsync(user.Id);
        var updatedPackage = await Factory.GetPackageAsync(package.Id);
        var transactions = await Factory.GetWalletTransactionsAsync(user.Id);
        var histories = await Factory.GetOrderHistoriesAsync(order.Id);

        if (updatedOrder.Status == OrderStatus.Cancelled)
        {
            cancelResponse.IsSuccessStatusCode.Should().BeTrue();
            pickResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            wallet!.Balance.Should().Be(packagePrice);
            updatedPackage!.AvailableSlots.Should().Be(3);
            transactions.Count(x => x.Type == WalletTransactionType.Refund && x.Amount == packagePrice).Should().Be(1);
            histories.Count(x => x.ToStatus == OrderStatus.Cancelled).Should().Be(1);
        }
        else
        {
            pickResponse.IsSuccessStatusCode.Should().BeTrue();
            cancelResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            updatedOrder.AssignedTo.Should().Be(admin.Id);
            wallet!.Balance.Should().Be(0m);
            updatedPackage!.AvailableSlots.Should().Be(2);
            transactions.Should().BeEmpty();
            histories.Count(x => x.ToStatus == OrderStatus.Processing).Should().Be(1);
        }
    }
}
