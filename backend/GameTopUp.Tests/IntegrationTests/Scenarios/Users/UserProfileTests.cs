using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using GameTopUp.Tests.IntegrationTests.Support;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.Users;

[Collection("Integration")]
public sealed class UserProfileTests : BaseIntegrationTest
{
    public UserProfileTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [DockerFact]
    public async Task MemberShouldSeeOwnProfile_ButNotOtherUsersProfile()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        var other = await Factory.SeedUserAsync(UserRole.Member);
        using var client = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var meResponse = await client.GetAsync("/api/users/me");
        meResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var meBody = await meResponse.ReadApiResponseAsync<UserResponseDTO>();
        meBody.Success.Should().BeTrue();
        meBody.Data.Should().NotBeNull();
        meBody.Data!.Id.Should().Be(member.Id);
        meBody.Data.Email.Should().Be(member.Email);

        var otherResponse = await client.GetAsync($"/api/users/{other.Id}");
        otherResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [DockerFact]
    public async Task MemberShouldUpdateOwnProfile_AndPersistChanges()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        using var client = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var response = await client.PutJsonAsync($"/api/users/{member.Id}", new UpdateUserRequest
        {
            DisplayName = "Renamed User",
            Email = "renamed-" + TestDatabaseExtensions.UniqueCode() + "@test.local"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.ReadApiResponseAsync<object>();
        body.Success.Should().BeTrue();

        var updated = await Factory.GetUserAsync(member.Id);
        updated.Should().NotBeNull();
        updated!.DisplayName.Should().Be("Renamed User");
        updated.Email.Should().StartWith("renamed-");
    }

    [DockerFact]
    public async Task MemberShouldNotDeleteUsers()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        var target = await Factory.SeedUserAsync(UserRole.Member);
        using var client = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var response = await client.DeleteAsync($"/api/users/{target.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [DockerFact]
    public async Task AdminShouldDeleteUser_AndUserShouldBeMarkedInactive()
    {
        var admin = await Factory.SeedAdminAsync();
        var target = await Factory.SeedUserAsync(UserRole.Member);
        using var client = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var deleteResponse = await client.DeleteAsync($"/api/admin/users/{target.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var deleted = await Factory.GetUserAsync(target.Id);
        deleted.Should().NotBeNull();
        deleted!.IsActive.Should().BeFalse();
    }
}
