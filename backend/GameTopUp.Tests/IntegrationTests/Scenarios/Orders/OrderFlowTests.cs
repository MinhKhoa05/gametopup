using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using GameTopUp.Tests.IntegrationTests.Support;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.Orders;

[Collection("Integration")]
public sealed class OrderFlowTests : BaseIntegrationTest
{
    public OrderFlowTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [DockerFact]
    public async Task PurchaseThenAdminPickAndComplete_ShouldAdvanceOrderThroughProcessingToCompleted()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        await Factory.SeedWalletAsync(member.Id, 1000m);
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedGamePackageAsync(game.Id, salePrice: 250m, stockQuantity: 3);
        var admin = await Factory.SeedAdminAsync();

        using var memberClient = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);
        using var adminClient = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var purchaseResponse = await memberClient.PostJsonAsync("/api/orders", new PurchaseOrderRequestDTO
        {
            GamePackageId = package.Id,
            GameAccountInfo = "  hero-account-01  "
        });

        purchaseResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var purchaseBody = await purchaseResponse.ReadApiResponseAsync<long>();
        purchaseBody.Success.Should().BeTrue();
        var orderId = purchaseBody.Data;
        orderId.Should().BeGreaterThan(0);

        var pickResponse = await adminClient.PostAsync($"/api/admin/orders/{orderId}/pick", null);
        pickResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var pickBody = await pickResponse.ReadApiResponseAsync<OrderActionResponseDTO>();
        pickBody.Success.Should().BeTrue();
        pickBody.Data.Should().NotBeNull();
        pickBody.Data!.Changed.Should().BeTrue();
        pickBody.Data.FromStatus.Should().Be(OrderStatus.Pending);
        pickBody.Data.ToStatus.Should().Be(OrderStatus.Processing);
        pickBody.Data.AssignTo.Should().Be(admin.Id);

        var completeResponse = await adminClient.PostAsync($"/api/admin/orders/{orderId}/complete", null);
        completeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var completeBody = await completeResponse.ReadApiResponseAsync<OrderActionResponseDTO>();
        completeBody.Success.Should().BeTrue();
        completeBody.Data.Should().NotBeNull();
        completeBody.Data!.Changed.Should().BeTrue();
        completeBody.Data.FromStatus.Should().Be(OrderStatus.Processing);
        completeBody.Data.ToStatus.Should().Be(OrderStatus.Completed);

        var order = await Factory.GetOrderAsync(orderId);
        order.Should().NotBeNull();
        order!.Status.Should().Be(OrderStatus.Completed);
        order.AssignedTo.Should().Be(admin.Id);

        var wallet = await Factory.GetWalletAsync(member.Id);
        wallet.Should().NotBeNull();
        wallet!.Balance.Should().Be(750m);

        var refreshedPackage = await Factory.GetGamePackageAsync(package.Id);
        refreshedPackage.Should().NotBeNull();
        refreshedPackage!.StockQuantity.Should().Be(2);

        var transactions = await Factory.GetWalletTransactionsAsync(member.Id);
        transactions.Should().ContainSingle(transaction => transaction.Type == WalletTransactionType.PurchaseOrder);
        transactions.Should().NotContain(transaction => transaction.Type == WalletTransactionType.Refund);

        var histories = await Factory.GetOrderHistoriesAsync(orderId);
        histories.Should().HaveCount(3);
        histories.Select(history => history.ToStatus).Should().BeEquivalentTo(new[]
        {
            OrderStatus.Completed,
            OrderStatus.Processing,
            OrderStatus.Pending
        });
    }

    [DockerFact]
    public async Task AdminPickingSameOrderTwice_ShouldBeIdempotent()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        await Factory.SeedWalletAsync(member.Id, 1000m);
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedGamePackageAsync(game.Id, salePrice: 250m, stockQuantity: 2);
        var admin = await Factory.SeedAdminAsync();

        using var memberClient = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);
        using var adminClient = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var purchaseResponse = await memberClient.PostJsonAsync("/api/orders", new PurchaseOrderRequestDTO
        {
            GamePackageId = package.Id,
            GameAccountInfo = "idempotent-pick-account"
        });
        var orderId = (await purchaseResponse.ReadApiResponseAsync<long>()).Data;

        var firstPickResponse = await adminClient.PostAsync($"/api/admin/orders/{orderId}/pick", null);
        firstPickResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var firstPickBody = await firstPickResponse.ReadApiResponseAsync<OrderActionResponseDTO>();
        firstPickBody.Data.Should().NotBeNull();
        firstPickBody.Data!.Changed.Should().BeTrue();
        firstPickBody.Data.FromStatus.Should().Be(OrderStatus.Pending);
        firstPickBody.Data.ToStatus.Should().Be(OrderStatus.Processing);
        firstPickBody.Data.AssignTo.Should().Be(admin.Id);

        var historyCountAfterFirstPick = await Factory.GetOrderHistoryCountAsync(orderId);
        historyCountAfterFirstPick.Should().Be(2);

        var secondPickResponse = await adminClient.PostAsync($"/api/admin/orders/{orderId}/pick", null);
        secondPickResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var secondPickBody = await secondPickResponse.ReadApiResponseAsync<OrderActionResponseDTO>();
        secondPickBody.Data.Should().NotBeNull();
        secondPickBody.Data!.Changed.Should().BeFalse();
        secondPickBody.Data.FromStatus.Should().BeNull();
        secondPickBody.Data.ToStatus.Should().Be(OrderStatus.Processing);
        secondPickBody.Data.AssignTo.Should().Be(admin.Id);

        var order = await Factory.GetOrderAsync(orderId);
        order.Should().NotBeNull();
        order!.Status.Should().Be(OrderStatus.Processing);
        order.AssignedTo.Should().Be(admin.Id);

        var historyCountAfterSecondPick = await Factory.GetOrderHistoryCountAsync(orderId);
        historyCountAfterSecondPick.Should().Be(2);
    }

    [DockerFact]
    public async Task ConcurrentPurchasesAgainstLastStockItem_ShouldAllowOnlyOneSuccess()
    {
        var buyerOne = await Factory.SeedUserAsync(UserRole.Member);
        var buyerTwo = await Factory.SeedUserAsync(UserRole.Member);
        await Factory.SeedWalletAsync(buyerOne.Id, 1000m);
        await Factory.SeedWalletAsync(buyerTwo.Id, 1000m);
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedGamePackageAsync(game.Id, salePrice: 250m, stockQuantity: 1);

        using var clientOne = CreateAuthenticatedClient(buyerOne.Id, buyerOne.DisplayName, buyerOne.Email, buyerOne.Role);
        using var clientTwo = CreateAuthenticatedClient(buyerTwo.Id, buyerTwo.DisplayName, buyerTwo.Email, buyerTwo.Role);

        var gate = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);

        var purchaseOne = Task.Run(async () =>
        {
            await gate.Task;
            return await clientOne.PostJsonAsync("/api/orders", new PurchaseOrderRequestDTO
            {
                GamePackageId = package.Id,
                GameAccountInfo = "buyer-one-account"
            });
        });

        var purchaseTwo = Task.Run(async () =>
        {
            await gate.Task;
            return await clientTwo.PostJsonAsync("/api/orders", new PurchaseOrderRequestDTO
            {
                GamePackageId = package.Id,
                GameAccountInfo = "buyer-two-account"
            });
        });

        gate.SetResult();
        var responses = await Task.WhenAll(purchaseOne, purchaseTwo);

        var successResponses = responses.Where(response => response.StatusCode == HttpStatusCode.Created).ToList();
        var failedResponses = responses.Where(response => response.StatusCode == HttpStatusCode.BadRequest).ToList();

        successResponses.Should().ContainSingle();
        failedResponses.Should().ContainSingle();

        var failedBody = await failedResponses.Single().ReadApiResponseAsync<object>();
        failedBody.Success.Should().BeFalse();
        failedBody.ErrorCode.Should().Be("PackageOutOfStock");

        var orders = await Factory.GetOrdersAsync();
        orders.Should().ContainSingle(order => order.GamePackageId == package.Id);

        var order = orders.Single(order => order.GamePackageId == package.Id);
        order.Status.Should().Be(OrderStatus.Pending);
        order.UserId.Should().BeOneOf(buyerOne.Id, buyerTwo.Id);

        var refreshedPackage = await Factory.GetGamePackageAsync(package.Id);
        refreshedPackage.Should().NotBeNull();
        refreshedPackage!.StockQuantity.Should().Be(0);

        var buyerOneWallet = await Factory.GetWalletAsync(buyerOne.Id);
        var buyerTwoWallet = await Factory.GetWalletAsync(buyerTwo.Id);
        buyerOneWallet.Should().NotBeNull();
        buyerTwoWallet.Should().NotBeNull();
        new[] { buyerOneWallet!.Balance, buyerTwoWallet!.Balance }.Should().ContainSingle(balance => balance == 750m);
        new[] { buyerOneWallet.Balance, buyerTwoWallet.Balance }.Should().ContainSingle(balance => balance == 1000m);

        var transactionsOne = await Factory.GetWalletTransactionsAsync(buyerOne.Id);
        var transactionsTwo = await Factory.GetWalletTransactionsAsync(buyerTwo.Id);
        var transactionCount = transactionsOne.Count + transactionsTwo.Count;
        transactionCount.Should().Be(1);
        transactionsOne.Concat(transactionsTwo).Should().ContainSingle(transaction => transaction.Type == WalletTransactionType.PurchaseOrder);

        var historyCount = await Factory.GetOrderHistoryCountAsync(order.Id);
        historyCount.Should().Be(1);
    }

    [DockerFact]
    public async Task CancelPendingOrder_ShouldRestoreWalletAndStock()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        await Factory.SeedWalletAsync(member.Id, 1000m);
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedGamePackageAsync(game.Id, salePrice: 300m, stockQuantity: 2);

        using var memberClient = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var purchaseResponse = await memberClient.PostJsonAsync("/api/orders", new PurchaseOrderRequestDTO
        {
            GamePackageId = package.Id,
            GameAccountInfo = "hero-restore-test"
        });

        var purchaseBody = await purchaseResponse.ReadApiResponseAsync<long>();
        var orderId = purchaseBody.Data;

        var cancelResponse = await memberClient.PostAsync($"/api/orders/{orderId}/cancel", null);
        cancelResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var cancelBody = await cancelResponse.ReadApiResponseAsync<OrderActionResponseDTO>();
        cancelBody.Success.Should().BeTrue();
        cancelBody.Data.Should().NotBeNull();
        cancelBody.Data!.Changed.Should().BeTrue();
        cancelBody.Data.FromStatus.Should().Be(OrderStatus.Pending);
        cancelBody.Data.ToStatus.Should().Be(OrderStatus.Cancelled);

        var historyCountAfterFirstCancel = await Factory.GetOrderHistoryCountAsync(orderId);
        historyCountAfterFirstCancel.Should().Be(2);

        var order = await Factory.GetOrderAsync(orderId);
        order.Should().NotBeNull();
        order!.Status.Should().Be(OrderStatus.Cancelled);

        var wallet = await Factory.GetWalletAsync(member.Id);
        wallet.Should().NotBeNull();
        wallet!.Balance.Should().Be(1000m);

        var refreshedPackage = await Factory.GetGamePackageAsync(package.Id);
        refreshedPackage.Should().NotBeNull();
        refreshedPackage!.StockQuantity.Should().Be(2);

        var transactions = await Factory.GetWalletTransactionsAsync(member.Id);
        transactions.Should().Contain(transaction => transaction.Type == WalletTransactionType.PurchaseOrder);
        transactions.Should().Contain(transaction => transaction.Type == WalletTransactionType.Refund);

        var secondCancelResponse = await memberClient.PostAsync($"/api/orders/{orderId}/cancel", null);
        secondCancelResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var secondCancelBody = await secondCancelResponse.ReadApiResponseAsync<OrderActionResponseDTO>();
        secondCancelBody.Data.Should().NotBeNull();
        secondCancelBody.Data!.Changed.Should().BeFalse();
        secondCancelBody.Data.FromStatus.Should().BeNull();
        secondCancelBody.Data.ToStatus.Should().Be(OrderStatus.Cancelled);
        secondCancelBody.Data.AssignTo.Should().BeNull();

        var walletAfterSecondCancel = await Factory.GetWalletAsync(member.Id);
        walletAfterSecondCancel.Should().NotBeNull();
        walletAfterSecondCancel!.Balance.Should().Be(1000m);

        var packageAfterSecondCancel = await Factory.GetGamePackageAsync(package.Id);
        packageAfterSecondCancel.Should().NotBeNull();
        packageAfterSecondCancel!.StockQuantity.Should().Be(2);

        var transactionsAfterSecondCancel = await Factory.GetWalletTransactionsAsync(member.Id);
        transactionsAfterSecondCancel.Should().HaveCount(2);
        transactionsAfterSecondCancel.Should().ContainSingle(transaction => transaction.Type == WalletTransactionType.Refund);

        var histories = await Factory.GetOrderHistoriesAsync(orderId);
        histories.Should().HaveCount(2);
        histories.Select(history => history.ToStatus).Should().Contain(OrderStatus.Cancelled);

        var historyCountAfterSecondCancel = await Factory.GetOrderHistoryCountAsync(orderId);
        historyCountAfterSecondCancel.Should().Be(2);
    }
}
