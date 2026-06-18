using System.Net;
using FluentAssertions;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using GameTopUp.Tests.IntegrationTests.Support;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.Orders;

[Collection("Integration")]
public sealed class OrderAccessTests : BaseIntegrationTest
{
    public OrderAccessTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [DockerFact]
    public async Task MemberShouldSeeOwnOrderButNotAnotherUsersOrderOrHistory()
    {
        var owner = await Factory.SeedUserAsync(UserRole.Member);
        var other = await Factory.SeedUserAsync(UserRole.Member);
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedGamePackageAsync(game.Id, salePrice: 100m, stockQuantity: 1);
        var ownedOrder = await Factory.SeedOrderAsync(owner.Id, package.Id);
        var foreignOrder = await Factory.SeedOrderAsync(other.Id, package.Id);

        using var ownerClient = CreateAuthenticatedClient(owner.Id, owner.DisplayName, owner.Email, owner.Role);

        var ownOrderResponse = await ownerClient.GetAsync($"/api/orders/{ownedOrder.Id}");
        ownOrderResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var ownOrderBody = await ownOrderResponse.ReadApiResponseAsync<Order>();
        ownOrderBody.Data.Should().NotBeNull();
        ownOrderBody.Data!.Id.Should().Be(ownedOrder.Id);
        ownOrderBody.Data.UserId.Should().Be(owner.Id);

        var ownHistoryResponse = await ownerClient.GetAsync($"/api/orders/{ownedOrder.Id}/history");
        ownHistoryResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var ownHistoryBody = await ownHistoryResponse.ReadApiResponseAsync<List<OrderHistory>>();
        ownHistoryBody.Data.Should().NotBeNull();

        var foreignOrderResponse = await ownerClient.GetAsync($"/api/orders/{foreignOrder.Id}");
        foreignOrderResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var foreignHistoryResponse = await ownerClient.GetAsync($"/api/orders/{foreignOrder.Id}/history");
        foreignHistoryResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [DockerFact]
    public async Task AdminShouldAccessAnyOrderAndHistory()
    {
        var owner = await Factory.SeedUserAsync(UserRole.Member);
        var admin = await Factory.SeedAdminAsync();
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedGamePackageAsync(game.Id, salePrice: 100m, stockQuantity: 1);
        var order = await Factory.SeedOrderAsync(owner.Id, package.Id);

        using var adminClient = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var orderResponse = await adminClient.GetAsync($"/api/admin/orders/{order.Id}");
        orderResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var historyResponse = await adminClient.GetAsync($"/api/admin/orders/{order.Id}/history");
        historyResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
