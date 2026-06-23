using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class UserApiTests : BaseIntegrationTest
{
    public UserApiTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetMyProfile_ShouldReturnCurrentUserProfile()
    {
        var user = await Factory.SeedUserAsync(customize: u =>
        {
            u.DisplayName = "Profile User";
            u.Email = "profile-user@test.local";
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.GetAsync("/api/users/me");

        var profile = await response.ShouldBeSuccess<UserResponse>();

        profile.Id.Should().Be(user.Id);
        profile.DisplayName.Should().Be(user.DisplayName);
        profile.Email.Should().Be(user.Email);
        profile.Role.Should().Be(UserRole.Member);
        profile.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateMyProfile_ShouldPersistDisplayName()
    {
        var user = await Factory.SeedUserAsync(customize: u =>
        {
            u.DisplayName = "Old Name";
        });

        using var client = CreateHeaderAuthenticatedClient(user);

        var response = await client.PutJsonAsync("/api/users/me", new UpdateProfileRequest
        {
            DisplayName = "  New Display Name  "
        });

        await response.ShouldBeSuccess();

        var updatedUser = await Factory.GetUserAsync(user.Id);

        updatedUser.Should().NotBeNull();
        updatedUser!.DisplayName.Should().Be("New Display Name");
    }

    [Fact]
    public async Task ProtectedEndpoints_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var getResponse = await Client.GetAsync("/api/users/me");
        getResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var putResponse = await Client.PutJsonAsync("/api/users/me", new UpdateProfileRequest
        {
            DisplayName = "Name"
        });
        putResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
