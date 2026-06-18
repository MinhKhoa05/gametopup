using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using GameTopUp.Tests.IntegrationTests.Support;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.Authorization;

[Collection("Integration")]
public sealed class OrderAuthorizationTests : BaseIntegrationTest
{
    public OrderAuthorizationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [DockerFact]
    public async Task MemberShouldReceiveForbidden_WhenCallingAdminPickEndpoint()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        await Factory.SeedWalletAsync(member.Id, 1000m);
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedGamePackageAsync(game.Id, salePrice: 150m, stockQuantity: 1);

        using var memberClient = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var purchaseResponse = await memberClient.PostJsonAsync("/api/orders", new PurchaseOrderRequestDTO
        {
            GamePackageId = package.Id,
            GameAccountInfo = "hero-authz"
        });
        var purchaseBody = await purchaseResponse.ReadApiResponseAsync<long>();
        var orderId = purchaseBody.Data;

        var pickResponse = await memberClient.PostAsync($"/api/admin/orders/{orderId}/pick", null);

        pickResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
