using System.Net;
using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities;
using GameTopUp.IntegrationTests.Extensions;
using GameTopUp.IntegrationTests.Infrastructure;

namespace GameTopUp.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class NotificationApiTests : BaseIntegrationTest
{
    public NotificationApiTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetNotifications_ShouldReturnCurrentUserNotifications()
    {
        var user = await Factory.SeedUserAsync();
        var otherUser = await Factory.SeedUserAsync();

        var first = await Factory.SeedNotificationAsync(user.Id, notification =>
        {
            notification.Title = "First";
            notification.CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-3);
        });
        var second = await Factory.SeedNotificationAsync(user.Id, notification =>
        {
            notification.Title = "Second";
            notification.CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-2);
        });
        var third = await Factory.SeedNotificationAsync(user.Id, notification =>
        {
            notification.Title = "Third";
            notification.CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-1);
        });
        await Factory.SeedNotificationAsync(otherUser.Id, notification =>
        {
            notification.Title = "Other user";
            notification.CreatedAt = DateTimeOffset.UtcNow;
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync("/api/notifications?limit=2");

        var firstPage = await response.ShouldBeSuccess<CursorPageResponse<NotificationResponse>>();

        firstPage.Items.Select(notification => notification.Id).Should().Equal(third.Id, second.Id);
        firstPage.NextCursor.Should().Be(second.Id);
        firstPage.HasMore.Should().BeTrue();

        response = await client.GetAsync($"/api/notifications?cursor={firstPage.NextCursor}&limit=2");

        var secondPage = await response.ShouldBeSuccess<CursorPageResponse<NotificationResponse>>();

        secondPage.Items.Should().ContainSingle(notification => notification.Id == first.Id);
        secondPage.NextCursor.Should().BeNull();
        secondPage.HasMore.Should().BeFalse();
    }

    [Fact]
    public async Task GetUnreadNotificationCount_ShouldReturnCurrentUserUnreadCount()
    {
        var user = await Factory.SeedUserAsync();
        var otherUser = await Factory.SeedUserAsync();

        await Factory.SeedNotificationAsync(user.Id);
        await Factory.SeedNotificationAsync(user.Id);
        await Factory.SeedNotificationAsync(user.Id, notification =>
        {
            notification.IsRead = true;
            notification.ReadAt = DateTimeOffset.UtcNow;
        });
        await Factory.SeedNotificationAsync(otherUser.Id);

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync("/api/notifications/unread-count");

        var result = await response.ShouldBeSuccess<UnreadNotificationCountResponse>();

        result.UnreadCount.Should().Be(2);
    }

    [Fact]
    public async Task MarkNotificationAsRead_ShouldMarkCurrentUserNotificationRead()
    {
        var user = await Factory.SeedUserAsync();
        var notification = await Factory.SeedNotificationAsync(user.Id);

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.PatchAsync($"/api/notifications/{notification.Id}/read", null);

        await response.ShouldBeSuccess();

        var notifications = await Factory.GetNotificationsByUserAsync(user.Id);
        var updated = notifications.Should().ContainSingle(item => item.Id == notification.Id).Subject;

        updated.IsRead.Should().BeTrue();
        updated.ReadAt.Should().NotBeNull();
    }

    [Fact]
    public async Task MarkNotificationAsRead_ShouldReturnNotFound_WhenNotificationBelongsToAnotherUser()
    {
        var owner = await Factory.SeedUserAsync();
        var otherUser = await Factory.SeedUserAsync();
        var notification = await Factory.SeedNotificationAsync(owner.Id);

        using var client = CreateHeaderAuthenticatedClient(otherUser);

        var response = await client.PatchAsync($"/api/notifications/{notification.Id}/read", null);

        await response.ShouldHaveError(HttpStatusCode.NotFound, ErrorCode.NotFound);

        var notifications = await Factory.GetNotificationsByUserAsync(owner.Id);
        var unchanged = notifications.Should().ContainSingle(item => item.Id == notification.Id).Subject;

        unchanged.IsRead.Should().BeFalse();
        unchanged.ReadAt.Should().BeNull();
    }

    [Fact]
    public async Task ProtectedEndpoints_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var listResponse = await Client.GetAsync("/api/notifications");
        listResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var countResponse = await Client.GetAsync("/api/notifications/unread-count");
        countResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var readResponse = await Client.PatchAsync("/api/notifications/1/read", null);
        readResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
