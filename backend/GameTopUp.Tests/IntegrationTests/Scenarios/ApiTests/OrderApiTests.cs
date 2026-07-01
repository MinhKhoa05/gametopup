using System.Net;
using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class OrderApiTests : BaseIntegrationTest
{
    public OrderApiTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateOrder_ShouldCreateOrder()
    {
        var user = await Factory.SeedUserAsync();

        await Factory.SeedWalletAsync(user.Id, wallet =>
        {
            wallet.Balance = 500_000m;
        });

        var game = await Factory.SeedGameAsync();

        var package = await Factory.SeedPackageAsync(game.Id, package =>
        {
            package.SalePrice = 199_000m;
            package.AvailableSlots = 3;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.PostJsonAsync("/api/orders", new PurchaseOrderRequest
        {
            PackageId = package.Id,
            GameAccountInfo = "PLAYER-001"
        });

        var result = await response.ShouldBeSuccess<CreateOrderResponse>(HttpStatusCode.Created);

        var order = await Factory.GetOrderAsync(result.OrderId);

        order.Should().NotBeNull();
        order!.UserId.Should().Be(user.Id);
        order.PackageId.Should().Be(package.Id);
        order.Status.Should().Be(OrderStatus.Pending);
    }

    [Fact]
    public async Task GetOrderById_ShouldReturnOrder_WhenOwnedByCurrentUser()
    {
        var user = await Factory.SeedUserAsync();

        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedPackageAsync(game.Id);

        var order = await Factory.SeedOrderAsync(user.Id, package.Id);

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync($"/api/orders/{order.Id}");

        var result = await response.ShouldBeSuccess<OrderResponse>();

        result.Id.Should().Be(order.Id);
    }

    [Fact]
    public async Task GetOrders_ShouldPaginateByCursor()
    {
        var user = await Factory.SeedUserAsync();

        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedPackageAsync(game.Id);

        var firstOrder = await Factory.SeedOrderAsync(user.Id, package.Id, order =>
        {
            order.Status = OrderStatus.Pending;
        });

        var secondOrder = await Factory.SeedOrderAsync(user.Id, package.Id, order =>
        {
            order.Status = OrderStatus.Processing;
        });

        var thirdOrder = await Factory.SeedOrderAsync(user.Id, package.Id, order =>
        {
            order.Status = OrderStatus.Completed;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync("/api/orders?limit=2");

        var firstPage = await response.ShouldBeSuccess<CursorPageResponse<OrderResponse>>();

        firstPage.Items.Select(order => order.Id).Should().Equal(thirdOrder.Id, secondOrder.Id);
        firstPage.NextCursor.Should().Be(secondOrder.Id);
        firstPage.HasMore.Should().BeTrue();

        response = await client.GetAsync($"/api/orders?cursor={firstPage.NextCursor}&limit=2");

        var secondPage = await response.ShouldBeSuccess<CursorPageResponse<OrderResponse>>();

        secondPage.Items.Should().ContainSingle(order => order.Id == firstOrder.Id);
        secondPage.NextCursor.Should().BeNull();
        secondPage.HasMore.Should().BeFalse();
    }

    [Fact]
    public async Task GetOrders_ShouldApplyFilter()
    {
        var user = await Factory.SeedUserAsync();

        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedPackageAsync(game.Id);

        var pendingOrder = await Factory.SeedOrderAsync(user.Id, package.Id, order =>
        {
            order.Status = OrderStatus.Pending;
        });

        var processingOrder = await Factory.SeedOrderAsync(user.Id, package.Id, order =>
        {
            order.Status = OrderStatus.Processing;
        });

        await Factory.SeedOrderAsync(user.Id, package.Id, order =>
        {
            order.Status = OrderStatus.Completed;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync("/api/orders?filter=watching&limit=10");

        var page = await response.ShouldBeSuccess<CursorPageResponse<OrderResponse>>();

        page.Items.Select(order => order.Id).Should().Equal(processingOrder.Id, pendingOrder.Id);
        page.NextCursor.Should().BeNull();
        page.HasMore.Should().BeFalse();

        response = await client.GetAsync("/api/orders?filter=pending&limit=10");

        page = await response.ShouldBeSuccess<CursorPageResponse<OrderResponse>>();

        page.Items.Should().ContainSingle(order => order.Id == pendingOrder.Id);

        response = await client.GetAsync("/api/orders?filter=processing&limit=10");

        page = await response.ShouldBeSuccess<CursorPageResponse<OrderResponse>>();

        page.Items.Should().ContainSingle(order => order.Id == processingOrder.Id);
    }

    [Fact]
    public async Task GetOrderById_ShouldReturnForbidden_WhenOrderBelongsToAnotherUser()
    {
        var owner = await Factory.SeedUserAsync();
        var otherUser = await Factory.SeedUserAsync();

        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedPackageAsync(game.Id);

        var order = await Factory.SeedOrderAsync(owner.Id, package.Id);

        using var client = CreateHeaderAuthenticatedClient(otherUser);

        var response = await client.GetAsync($"/api/orders/{order.Id}");

        await response.ShouldHaveError(HttpStatusCode.Forbidden, ErrorCode.Forbidden);
    }

    [Fact]
    public async Task GetOrderHistory_ShouldReturnOrderHistory()
    {
        var user = await Factory.SeedUserAsync();

        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedPackageAsync(game.Id);

        var order = await Factory.SeedOrderAsync(user.Id, package.Id);

        await Factory.SeedOrderHistoryAsync(order.Id, user.Id);

        using var client = CreateHeaderAuthenticatedClient(user);

        var response =
            await client.GetAsync($"/api/orders/{order.Id}/history");

        var histories =
            await response.ShouldBeSuccess<List<OrderHistoryResponse>>();

        histories.Should().ContainSingle();
    }

    [Fact]
    public async Task GetOrderHistory_ShouldReturnForbidden_WhenOrderBelongsToAnotherUser()
    {
        var owner = await Factory.SeedUserAsync();
        var otherUser = await Factory.SeedUserAsync();

        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedPackageAsync(game.Id);

        var order = await Factory.SeedOrderAsync(owner.Id, package.Id);

        using var client = CreateHeaderAuthenticatedClient(otherUser);

        var response = await client.GetAsync($"/api/orders/{order.Id}/history");

        await response.ShouldHaveError(HttpStatusCode.Forbidden, ErrorCode.Forbidden);
    }

    [Fact]
    public async Task CancelOrder_ShouldCancelOrder()
    {
        var user = await Factory.SeedUserAsync();
        await Factory.SeedWalletAsync(user.Id);

        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedPackageAsync(game.Id);
        
        var order = await Factory.SeedOrderAsync(user.Id, package.Id);

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.PostAsync($"/api/orders/{order.Id}/cancel", null);

        await response.ShouldBeSuccess();

        var updatedOrder = await Factory.GetOrderAsync(order.Id);

        updatedOrder.Should().NotBeNull();
        updatedOrder!.Status.Should().Be(OrderStatus.Cancelled);
    }

    [Fact]
    public async Task CreateOrder_ShouldReturnBadRequest_WhenBalanceIsInsufficient()
    {
        var user = await Factory.SeedUserAsync();

        await Factory.SeedWalletAsync(user.Id, wallet =>
        {
            wallet.Balance = 50_000m;
        });

        var game = await Factory.SeedGameAsync();

        var package = await Factory.SeedPackageAsync(game.Id, package =>
        {
            package.SalePrice = 199_000m;
            package.AvailableSlots = 3;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.PostJsonAsync("/api/orders", new PurchaseOrderRequest
        {
            PackageId = package.Id,
            GameAccountInfo = "PLAYER-001"
        });

        await response.ShouldHaveError(HttpStatusCode.BadRequest, ErrorCode.InsufficientWalletBalance);
    }

    [Fact]
    public async Task ProtectedEndpoints_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var createResponse = await Client.PostJsonAsync("/api/orders", new PurchaseOrderRequest
        {
            PackageId = 1,
            GameAccountInfo = "PLAYER-001"
        });

        createResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var getResponse = await Client.GetAsync("/api/orders/1");

        getResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var cancelResponse = await Client.PostAsync("/api/orders/1/cancel", null);

        cancelResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
