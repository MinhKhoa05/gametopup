using System.Net;
using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Queries;
using GameTopUp.IntegrationTests.Extensions;
using GameTopUp.IntegrationTests.Infrastructure;

namespace GameTopUp.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class WalletApiTests : BaseIntegrationTest
{
    public WalletApiTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetBalance_ShouldReturnCurrentWalletBalance()
    {
        var user = await Factory.SeedUserAsync();

        await Factory.SeedWalletAsync(user.Id, wallet =>
        {
            wallet.Balance = 275_000m;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync("/api/wallet");

        var balance = await response.ShouldBeSuccess<decimal>();

        balance.Should().Be(275_000m);
    }

    [Fact]
    public async Task GetWalletTransactions_ShouldReturnCurrentUserTransactions()
    {
        var user = await Factory.SeedUserAsync();

        var wallet = await Factory.SeedWalletAsync(user.Id);

        await Factory.SeedWalletTransactionAsync(user.Id);

        var client = CreateHeaderAuthenticatedClient(user);
        var response = await client.GetAsync("/api/wallet/transactions");

        var transactions = await response.ShouldBeSuccess<CursorPageResponse<WalletTransactionResponse>>();

        transactions.Items.Should().ContainSingle();
    }

    [Fact]
    public async Task GetWalletTransactions_ShouldPaginateByCursorAndApplyFilter()
    {
        var user = await Factory.SeedUserAsync();

        await Factory.SeedWalletAsync(user.Id);

        var deposit = await Factory.SeedWalletTransactionAsync(user.Id, transaction =>
        {
            transaction.Type = GameTopUp.DAL.Entities.WalletTransactionType.Deposit;
        });

        var purchase = await Factory.SeedWalletTransactionAsync(user.Id, transaction =>
        {
            transaction.Type = GameTopUp.DAL.Entities.WalletTransactionType.PurchaseOrder;
        });

        var refund = await Factory.SeedWalletTransactionAsync(user.Id, transaction =>
        {
            transaction.Type = GameTopUp.DAL.Entities.WalletTransactionType.Refund;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync("/api/wallet/transactions?limit=2");

        var firstPage = await response.ShouldBeSuccess<CursorPageResponse<WalletTransactionResponse>>();

        firstPage.Items.Select(transaction => transaction.Id).Should().Equal(refund.Id, purchase.Id);
        firstPage.NextCursor.Should().Be(purchase.Id);
        firstPage.HasMore.Should().BeTrue();

        response = await client.GetAsync($"/api/wallet/transactions?cursor={firstPage.NextCursor}&limit=2");

        var secondPage = await response.ShouldBeSuccess<CursorPageResponse<WalletTransactionResponse>>();

        secondPage.Items.Should().ContainSingle(transaction => transaction.Id == deposit.Id);
        secondPage.NextCursor.Should().BeNull();
        secondPage.HasMore.Should().BeFalse();

        response = await client.GetAsync("/api/wallet/transactions?filter=deposit&limit=10");

        var filteredPage = await response.ShouldBeSuccess<CursorPageResponse<WalletTransactionResponse>>();

        filteredPage.Items.Should().ContainSingle(transaction => transaction.Id == deposit.Id);
        filteredPage.NextCursor.Should().BeNull();
        filteredPage.HasMore.Should().BeFalse();

        response = await client.GetAsync("/api/wallet/transactions?filter=purchaseOrder&limit=10");

        filteredPage = await response.ShouldBeSuccess<CursorPageResponse<WalletTransactionResponse>>();

        filteredPage.Items.Should().ContainSingle(transaction => transaction.Id == purchase.Id);

        response = await client.GetAsync("/api/wallet/transactions?filter=refund&limit=10");

        filteredPage = await response.ShouldBeSuccess<CursorPageResponse<WalletTransactionResponse>>();

        filteredPage.Items.Should().ContainSingle(transaction => transaction.Id == refund.Id);
    }

    [Fact]
    public async Task GetWalletStats_ShouldReturnCurrentUserOverview()
    {
        var user = await Factory.SeedUserAsync();
        var otherUser = await Factory.SeedUserAsync();

        await Factory.SeedWalletAsync(user.Id);
        await Factory.SeedWalletAsync(otherUser.Id);

        await Factory.SeedWalletTransactionAsync(user.Id, transaction =>
        {
            transaction.Type = WalletTransactionType.Deposit;
            transaction.Amount = 500_000m;
        });

        await Factory.SeedWalletTransactionAsync(user.Id, transaction =>
        {
            transaction.Type = WalletTransactionType.PurchaseOrder;
            transaction.Amount = -125_000m;
        });

        await Factory.SeedWalletTransactionAsync(user.Id, transaction =>
        {
            transaction.Type = WalletTransactionType.Refund;
            transaction.Amount = 25_000m;
        });

        await Factory.SeedWalletTransactionAsync(otherUser.Id, transaction =>
        {
            transaction.Type = WalletTransactionType.Deposit;
            transaction.Amount = 999_000m;
        });

        await Factory.SeedWalletDepositAsync(user.Id);
        await Factory.SeedWalletDepositAsync(user.Id, deposit =>
        {
            deposit.Status = WalletDepositStatus.Approved;
        });
        await Factory.SeedWalletDepositAsync(user.Id, deposit =>
        {
            deposit.Status = WalletDepositStatus.Rejected;
        });
        await Factory.SeedWalletDepositAsync(otherUser.Id);

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync("/api/wallet/stats");

        var stats = await response.ShouldBeSuccess<WalletStatsResponse>();

        stats.TotalDeposited.Should().Be(500_000m);
        stats.TotalSpent.Should().Be(125_000m);
        stats.WalletTransactions.Should().Be(3);
        stats.SuccessfulDeposits.Should().Be(1);
    }

    [Fact]
    public async Task ProtectedEndpoints_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var balanceResponse = await Client.GetAsync("/api/wallet");

        balanceResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var transactionResponse = await Client.GetAsync("/api/wallet/transactions");

        transactionResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var statsResponse = await Client.GetAsync("/api/wallet/stats");

        statsResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
