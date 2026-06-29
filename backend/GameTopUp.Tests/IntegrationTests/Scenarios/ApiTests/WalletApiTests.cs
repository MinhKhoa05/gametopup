using System.Net;
using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests;

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

        var transactions = await response.ShouldBeSuccess<List<WalletTransactionResponse>>();

        transactions.Should().ContainSingle();
    }

    [Fact]
    public async Task ProtectedEndpoints_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var balanceResponse = await Client.GetAsync("/api/wallet");

        balanceResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var transactionResponse = await Client.GetAsync("/api/wallet/transactions");

        transactionResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
