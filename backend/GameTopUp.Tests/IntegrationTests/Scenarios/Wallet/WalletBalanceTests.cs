using System.Net;
using FluentAssertions;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using GameTopUp.Tests.IntegrationTests.Support;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.Wallet;

[Collection("Integration")]
public sealed class WalletBalanceTests : BaseIntegrationTest
{
    public WalletBalanceTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [DockerFact]
    public async Task GetBalance_ShouldReturnBalance_ForAuthenticatedUser()
    {
        var user = await Factory.SeedUserAsync(UserRole.Member);
        var wallet = await Factory.SeedWalletAsync(user.Id, 1250.50m);
        using var client = CreateAuthenticatedClient(user.Id, user.DisplayName, user.Email, user.Role);

        var response = await client.GetAsync("/api/wallet");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.ReadApiResponseAsync<decimal>();
        body.Success.Should().BeTrue();
        body.Data.Should().Be(wallet.Balance);
    }
}
