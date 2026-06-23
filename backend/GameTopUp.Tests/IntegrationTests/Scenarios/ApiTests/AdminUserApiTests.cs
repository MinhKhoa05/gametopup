using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class AdminUserApiTests : BaseIntegrationTest
{
    public AdminUserApiTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetAll_ShouldReturnUsers()
    {
        var first = await Factory.SeedUserAsync(customize: user =>
            user.DisplayName = "First User");

        var second = await Factory.SeedUserAsync(customize: user =>
            user.DisplayName = "Second User");

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.GetAsync("/api/admin/users");
        
        var users = await response.ShouldBeSuccess<List<UserResponse>>();

        users.Should().Contain(user =>
            user.Id == first.Id &&
            user.DisplayName == first.DisplayName);

        users.Should().Contain(user =>
            user.Id == second.Id &&
            user.DisplayName == second.DisplayName);
    }

    [Fact]
    public async Task GetById_ShouldReturnUser()
    {
        var user = await Factory.SeedUserAsync(customize: u =>
        {
            u.DisplayName = "Profile User";
            u.Email = "profile-user@test.local";
        });

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.GetAsync($"/api/admin/users/{user.Id}");
        
        var userResponse = await response.ShouldBeSuccess<UserResponse>();

        userResponse.Should().BeEquivalentTo(new
        {
            user.Id,
            user.DisplayName,
            user.Email,
            Role = UserRole.Member
        });
    }

    [Fact]
    public async Task GetById_ShouldReturnNotFound_WhenUserDoesNotExist()
    {
        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.GetAsync("/api/admin/users/999999");

        await response.ShouldHaveError(HttpStatusCode.NotFound, ErrorCode.UserNotFound);
    }

    [Fact]
    public async Task Delete_ShouldRemoveUser()
    {
        var user = await Factory.SeedUserAsync();

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.DeleteAsync($"/api/admin/users/{user.Id}");

        await response.ShouldBeSuccess();

        var deletedUser = await Factory.GetUserAsync(user.Id);

        deletedUser.Should().NotBeNull();
        deletedUser!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task Delete_ShouldReturnNotFound_WhenUserDoesNotExist()
    {
        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.DeleteAsync("/api/admin/users/999999");

        await response.ShouldHaveError(HttpStatusCode.NotFound, ErrorCode.UserNotFound);
    }

    [Fact]
    public async Task GetAll_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var response = await Client.GetAsync("/api/admin/users");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetAll_ShouldReturnForbidden_WhenMember()
    {
        var member = await Factory.SeedUserAsync();

        using var client = CreateHeaderAuthenticatedClient(member);

        var response = await client.GetAsync("/api/admin/users");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}