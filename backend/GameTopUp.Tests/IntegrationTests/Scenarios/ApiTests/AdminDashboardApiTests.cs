using System.Net;
using FluentAssertions;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Queries;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class AdminDashboardApiTests : BaseIntegrationTest
{
    public AdminDashboardApiTests(CustomWebApplicationFactory factory)
        : base(factory)
    {
    }

    [Fact]
    public async Task GetStats_ShouldReturnAdminDashboardStats()
    {
        var activeGame = await Factory.SeedGameAsync(game => game.IsActive = true);
        var inactiveGame = await Factory.SeedGameAsync(game => game.IsActive = false);

        await Factory.SeedPackageAsync(activeGame.Id, package => package.IsActive = true);
        await Factory.SeedPackageAsync(activeGame.Id, package => package.IsActive = false);
        await Factory.SeedPackageAsync(inactiveGame.Id, package => package.IsActive = true);

        await Factory.SeedOrderScenarioAsync(order => order.Status = OrderStatus.Pending);
        await Factory.SeedOrderScenarioAsync(order => order.Status = OrderStatus.Processing);
        await Factory.SeedOrderScenarioAsync(order => order.Status = OrderStatus.Completed);

        var user = await Factory.SeedUserAsync();
        await Factory.SeedWalletDepositAsync(user.Id, deposit => deposit.Status = WalletDepositStatus.Pending);
        await Factory.SeedWalletDepositAsync(user.Id, deposit => deposit.Status = WalletDepositStatus.UserConfirmed);
        await Factory.SeedWalletDepositAsync(user.Id, deposit => deposit.Status = WalletDepositStatus.Approved);

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.GetAsync("/api/admin/dashboard/stats");

        var stats = await response.ShouldBeSuccess<AdminDashboardStatsResponse>();

        stats.ActiveGames.Should().Be(4);
        stats.TotalGames.Should().Be(5);
        stats.ActivePackages.Should().Be(5);
        stats.TotalPackages.Should().Be(6);
        stats.PendingOrders.Should().Be(1);
        stats.PendingDeposits.Should().Be(2);
    }

    [Fact]
    public async Task GetStats_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var response = await Client.GetAsync("/api/admin/dashboard/stats");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetStats_ShouldReturnForbidden_WhenMember()
    {
        var member = await Factory.SeedUserAsync();

        using var client = CreateHeaderAuthenticatedClient(member);

        var response = await client.GetAsync("/api/admin/dashboard/stats");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
