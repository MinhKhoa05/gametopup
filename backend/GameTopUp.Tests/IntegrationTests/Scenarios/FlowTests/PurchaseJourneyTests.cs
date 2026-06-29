using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.DAL.Entities;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using System.Net;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.FlowTests;

[Collection("Integration")]
public sealed class PurchaseJourneyTests : BaseIntegrationTest
{
    public PurchaseJourneyTests(CustomWebApplicationFactory factory)
        : base(factory)
    {
    }

    [Fact]
    public async Task CompletePurchaseJourney_ShouldSucceed()
    {
        // Arrange
        var user = await Factory.SeedUserAsync();
        await Factory.SeedWalletAsync(user.Id);

        var admin = await Factory.SeedAdminAsync();
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedGamePackageAsync(game.Id, p =>
        {
            p.SalePrice = 100_000m;
            p.AvailableSlots = 5;
        });

        using var userClient = CreateHeaderAuthenticatedClient(user);
        using var adminClient = CreateHeaderAuthenticatedClient(admin);

        // Deposit Request
        var depositResponse = await userClient.PostJsonAsync(
            "/api/deposits",
            new CreateDepositRequest
            {
                Amount = 200_000m
            });

        var deposit = await depositResponse.ShouldBeSuccess<WalletDepositResponse>(HttpStatusCode.Created);

        // User Confirm Deposit
        var confirmResponse = await userClient.PostAsync($"/api/deposits/{deposit.Id}/confirm", null);
        await confirmResponse.ShouldBeSuccess();

        // Approve Deposit
        var approveResponse = await adminClient.PostAsync($"/api/admin/deposits/{deposit.Id}/approve", null);
        await approveResponse.ShouldBeSuccess();

        // Verify Wallet Credited
        var wallet = await Factory.GetWalletAsync(user.Id);
        wallet.Should().NotBeNull();
        wallet!.Balance.Should().Be(200_000m);

        // Purchase Order
        var purchaseResponse = await userClient.PostJsonAsync("/api/orders",
            new PurchaseOrderRequest
            {
                GamePackageId = package.Id,
                GameAccountInfo = "UID123456"
            });

        var createOrder = await purchaseResponse.ShouldBeSuccess<CreateOrderResponse>(HttpStatusCode.Created);
        var orderId = createOrder.OrderId;

        // Verify Order Created
        var order = await Factory.GetOrderAsync(orderId);
        order.Should().NotBeNull();
        order!.Status.Should().Be(OrderStatus.Pending);

        // Verify Wallet Deducted
        wallet = await Factory.GetWalletAsync(user.Id);
        wallet!.Balance.Should().Be(100_000m);

        // Verify Package Stock Reduced
        var updatedPackage = await Factory.GetGamePackageAsync(package.Id);
        updatedPackage.Should().NotBeNull();
        updatedPackage!.AvailableSlots.Should().Be(4);

        // Pick Order
        var pickResponse = await adminClient.PostAsync($"/api/admin/orders/{orderId}/pick", null);
        await pickResponse.ShouldBeSuccess();
        order = await Factory.GetOrderAsync(orderId);
        order!.Status.Should().Be(OrderStatus.Processing);
        order.AssignedTo.Should().Be(admin.Id);

        // Complete Order
        var completeResponse = await adminClient.PostAsync($"/api/admin/orders/{orderId}/complete", null);
        await completeResponse.ShouldBeSuccess();
        order = await Factory.GetOrderAsync(orderId);
        order!.Status.Should().Be(OrderStatus.Completed);

        // Verify Order History
        var histories = await Factory.GetOrderHistoriesAsync(orderId);

        histories.Should().Contain(x => x.ToStatus == OrderStatus.Pending);
        histories.Should().Contain(x => x.ToStatus == OrderStatus.Processing);
        histories.Should().Contain(x => x.ToStatus == OrderStatus.Completed);

        // Verify Wallet Transactions
        var transactions = await Factory.GetWalletTransactionsAsync(user.Id);
        transactions.Should().HaveCount(2);
        transactions.Should().Contain(x => x.Amount == 200_000m);
        transactions.Should().Contain(x => x.Amount == -100_000m);
    }
}
