using System.Net;
using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class AdminOrderApiTests : BaseIntegrationTest
{
    public AdminOrderApiTests(CustomWebApplicationFactory factory)
        : base(factory)
    {
    }

    [Fact]
    public async Task GetOrders_ShouldReturnAdminSummaries()
    {
        var orderScenario = await Factory.SeedOrderScenarioAsync();
        var userId = orderScenario.User.Id;
        var packageId = orderScenario.Package.Id;

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.GetAsync("/api/admin/orders");

        var orders = await response.ShouldBeSuccess<CursorPageResponse<AdminOrderResponse>>();

        var order = orders.Items.Should().ContainSingle().Subject;

        order.UserId.Should().Be(userId);
        order.PackageId.Should().Be(packageId);
        order.Status.Should().Be(OrderStatus.Pending);
    }

    [Fact]
    public async Task GetOrders_ShouldApplyFilter()
    {
        var pendingScenario = await Factory.SeedOrderScenarioAsync(order =>
        {
            order.Status = OrderStatus.Pending;
        });

        var processingScenario = await Factory.SeedOrderScenarioAsync(order =>
        {
            order.Status = OrderStatus.Processing;
        });

        await Factory.SeedOrderScenarioAsync(order =>
        {
            order.Status = OrderStatus.Completed;
        });

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.GetAsync("/api/admin/orders?filter=watching&limit=10");

        var page = await response.ShouldBeSuccess<CursorPageResponse<AdminOrderResponse>>();

        page.Items.Select(order => order.Id)
            .Should()
            .Equal(processingScenario.Order.Id, pendingScenario.Order.Id);
        page.NextCursor.Should().BeNull();
        page.HasMore.Should().BeFalse();

        response = await client.GetAsync("/api/admin/orders?filter=pending&limit=10");

        page = await response.ShouldBeSuccess<CursorPageResponse<AdminOrderResponse>>();

        page.Items.Should().ContainSingle(order => order.Id == pendingScenario.Order.Id);

        response = await client.GetAsync("/api/admin/orders?filter=processing&limit=10");

        page = await response.ShouldBeSuccess<CursorPageResponse<AdminOrderResponse>>();

        page.Items.Should().ContainSingle(order => order.Id == processingScenario.Order.Id);
    }

    [Fact]
    public async Task PickOrder_ShouldAssignOrderAndMoveToProcessing()
    {
        var orderScenario = await Factory.SeedOrderScenarioAsync();
        var orderId = orderScenario.Order.Id;

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostAsync($"/api/admin/orders/{orderId}/pick", null);

        await response.ShouldBeSuccess();

        var updated = await Factory.GetOrderAsync(orderId);

        updated.Should().NotBeNull();
        updated!.Status.Should().Be(OrderStatus.Processing);
        updated.AssignedTo.Should().Be(admin.Id);
    }

    [Fact]
    public async Task CompleteOrder_ShouldMoveOrderToCompleted()
    {
        var admin = await Factory.SeedAdminAsync();

        var orderScenario = await Factory.SeedOrderScenarioAsync(o =>
        {
            o.Status = OrderStatus.Processing;
            o.AssignedTo = admin.Id;
            o.AssignedAt = DateTimeOffset.UtcNow;
        });

        var orderId = orderScenario.Order.Id;

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostAsync($"/api/admin/orders/{orderId}/complete", null);

        await response.ShouldBeSuccess();

        var updated = await Factory.GetOrderAsync(orderId);

        updated.Should().NotBeNull();
        updated!.Status.Should().Be(OrderStatus.Completed);
    }

    [Fact]
    public async Task CancelOrder_ShouldAllowAdminToCancelPendingOrder()
    {
        var orderScenario = await Factory.SeedOrderScenarioAsync(o =>
        {
            o.Status = OrderStatus.Pending;
        });
        
        var userId = orderScenario.User.Id;
        var orderId = orderScenario.Order.Id;

        await Factory.SeedWalletAsync(userId);

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostAsync($"/api/admin/orders/{orderId}/cancel", null);

        await response.ShouldBeSuccess();

        var updated = await Factory.GetOrderAsync(orderId);

        updated.Should().NotBeNull();
        updated!.Status.Should().Be(OrderStatus.Cancelled);
    }

    [Fact]
    public async Task CancelOrder_ShouldAllowAssignedAdminToCancelProcessingOrder()
    {
        var admin = await Factory.SeedAdminAsync();

        var orderScenario = await Factory.SeedOrderScenarioAsync(o =>
        {
            o.Status = OrderStatus.Processing;
            o.AssignedTo = admin.Id;
            o.AssignedAt = DateTimeOffset.UtcNow;
        });

        var orderId = orderScenario.Order.Id;
        var userId = orderScenario.User.Id;

        await Factory.SeedWalletAsync(userId);

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostAsync($"/api/admin/orders/{orderId}/cancel", null);

        await response.ShouldBeSuccess();

        var updated = await Factory.GetOrderAsync(orderId);

        updated!.Status.Should().Be(OrderStatus.Cancelled);
    }

    [Fact]
    public async Task CancelOrder_ShouldReturnForbidden_WhenProcessingOrderAssignedToAnotherAdmin()
    {
        var assignedAdmin = await Factory.SeedAdminAsync();
        var anotherAdmin = await Factory.SeedAdminAsync();

        var orderScenario = await Factory.SeedOrderScenarioAsync(o =>
        {
            o.Status = OrderStatus.Processing;
            o.AssignedTo = assignedAdmin.Id;
            o.AssignedAt = DateTimeOffset.UtcNow;
        });

        var userId = orderScenario.User.Id;
        var orderId = orderScenario.Order.Id;

        await Factory.SeedWalletAsync(userId);

        using var client = CreateHeaderAuthenticatedClient(anotherAdmin);

        var response = await client.PostAsync($"/api/admin/orders/{orderId}/cancel", null);

        await response.ShouldHaveError(HttpStatusCode.Forbidden, ErrorCode.Forbidden);

        var updated = await Factory.GetOrderAsync(orderId);

        updated.Should().NotBeNull();
        updated!.Status.Should().Be(OrderStatus.Processing);
        updated.AssignedTo.Should().Be(assignedAdmin.Id);
    }

    [Fact]
    public async Task GetOrders_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var response = await Client.GetAsync("/api/admin/orders");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetOrders_ShouldReturnForbidden_WhenMember()
    {
        var member = await Factory.SeedUserAsync();

        using var client = CreateHeaderAuthenticatedClient(member);

        var response = await client.GetAsync("/api/admin/orders");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
