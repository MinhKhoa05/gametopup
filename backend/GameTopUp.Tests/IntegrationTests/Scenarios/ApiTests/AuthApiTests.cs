using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using Renci.SshNet;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests.Auth;

[Collection("Integration")]
public sealed class AuthApiTests : BaseIntegrationTest
{
    public AuthApiTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Register_ShouldCreateMemberUser()
    {
        var request = new CreateUserRequest
        {
            DisplayName = "Register User",
            Email = TestDatabaseExtensions.UniqueEmail("register"),
            Password = TestDatabaseExtensions.DefaultUserPassword
        };

        var response = await Client.PostJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var user = await Factory.GetUserByEmailAsync(request.Email);

        user.Should().NotBeNull();
        user!.Email.Should().Be(request.Email);
        user.DisplayName.Should().Be(request.DisplayName);
        user.Role.Should().Be(UserRole.Member);
        user.PasswordHash.Should().NotBeNullOrWhiteSpace();
        user.PasswordHash.Should().NotBe(request.Password);
    }

    [Fact]
    public async Task Login_ShouldSetAuthCookies()
    {
        var user = await Factory.SeedUserAsync();

        var response = await Client.PostJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = user.Email,
            Password = TestDatabaseExtensions.DefaultUserPassword
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.ReadApiResponseAsync<AuthResponseDTO>();
        body.Success.Should().BeTrue();
        body.Data.Should().NotBeNull();
        body.Data!.User.Should().NotBeNull();
        body.Data.User!.Email.Should().Be(user.Email);

        var cookies = response.GetSetCookieHeaders();

        cookies.ExtractCookieValue("accessToken").Should().NotBeNullOrWhiteSpace();
        cookies.ExtractCookieValue("refreshToken").Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenPasswordIsInvalid()
    {
        var user = await Factory.SeedUserAsync();

        var response = await Client.PostJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = user.Email,
            Password = "WrongPassword123!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var body = await response.ReadApiResponseAsync<object>();
        body.Success.Should().BeFalse();
        body.ErrorCode.Should().Be(ErrorCode.InvalidCredentials);

        var cookies = response.GetSetCookieHeaders();

        cookies.ExtractCookieValue("accessToken").Should().BeNull();
        cookies.ExtractCookieValue("refreshToken").Should().BeNull();
    }

    [Fact]
    public async Task Refresh_ShouldRotateTokens_AndRejectReusedRefreshToken()
    {
        var session = await CreateLoggedInSessionAsync();

        using var client = CreateClient();
        client.ReplaceCookieHeader($"refreshToken={session.RefreshToken}");

        var response = await client.PostAsync("/api/auth/refresh", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var cookies = response.GetSetCookieHeaders();
        var rotatedAccessToken = cookies.ExtractCookieValue("accessToken");
        var rotatedRefreshToken = cookies.ExtractCookieValue("refreshToken");

        rotatedAccessToken.Should().NotBeNullOrWhiteSpace();
        rotatedRefreshToken.Should().NotBeNullOrWhiteSpace();
        rotatedAccessToken.Should().NotBe(session.AccessToken);
        rotatedRefreshToken.Should().NotBe(session.RefreshToken);

        using var reusedClient = CreateClient();
        reusedClient.ReplaceCookieHeader($"refreshToken={session.RefreshToken}");

        var reusedResponse = await reusedClient.PostAsync("/api/auth/refresh", null);

        reusedResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var reusedBody = await reusedResponse.ReadApiResponseAsync<object>();
        reusedBody.Success.Should().BeFalse();
        reusedBody.ErrorCode.Should().Be(ErrorCode.InvalidRefreshToken);
    }

    [Fact]
    public async Task Refresh_ShouldReturnUnauthorized_WhenRefreshCookieIsMissing()
    {
        var response = await Client.PostAsync("/api/auth/refresh", null);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var body = await response.ReadApiResponseAsync<object>();
        body.Success.Should().BeFalse();
        body.ErrorCode.Should().Be(ErrorCode.InvalidRefreshToken);
    }

    [Fact]
    public async Task Logout_ShouldClearSessionCookies_AndInvalidateRefreshToken()
    {
        var session = await CreateLoggedInSessionAsync();
    
        using var client = CreateHeaderAuthenticatedClient(session.User);
        client.ReplaceCookieHeader($"refreshToken={session.RefreshToken}");

        var response = await client.PostAsync("/api/auth/logout", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var cookies = response.GetSetCookieHeaders();

        cookies.Should().Contain(cookie =>
            cookie.Contains("accessToken=", StringComparison.OrdinalIgnoreCase) &&
            cookie.Contains("expires=", StringComparison.OrdinalIgnoreCase));

        cookies.Should().Contain(cookie =>
            cookie.Contains("refreshToken=", StringComparison.OrdinalIgnoreCase) &&
            cookie.Contains("expires=", StringComparison.OrdinalIgnoreCase));

        using var refreshAfterLogoutClient = CreateClient();
        refreshAfterLogoutClient.ReplaceCookieHeader($"refreshToken={session.RefreshToken}");

        var refreshAfterLogoutResponse = await refreshAfterLogoutClient.PostAsync("/api/auth/refresh", null);

        refreshAfterLogoutResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var refreshAfterLogoutBody = await refreshAfterLogoutResponse.ReadApiResponseAsync<object>();
        refreshAfterLogoutBody.Success.Should().BeFalse();
        refreshAfterLogoutBody.ErrorCode.Should().Be(ErrorCode.InvalidRefreshToken);
    }

    [Fact]
    public async Task ChangePassword_ShouldUpdatePassword_AndRequireNewPassword()
    {
        var session = await CreateLoggedInSessionAsync();
        const string newPassword = "NewPassword123!";

        using var client = CreateHeaderAuthenticatedClient(session.User);

        var response = await client.PutJsonAsync("/api/auth/password", new PasswordChangeRequest
        {
            CurrentPassword = TestDatabaseExtensions.DefaultUserPassword,
            NewPassword = newPassword
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var oldPasswordLoginResponse = await Client.PostJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = session.User.Email,
            Password = TestDatabaseExtensions.DefaultUserPassword
        });

        oldPasswordLoginResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var oldPasswordBody = await oldPasswordLoginResponse.ReadApiResponseAsync<object>();
        oldPasswordBody.Success.Should().BeFalse();
        oldPasswordBody.ErrorCode.Should().Be(ErrorCode.InvalidCredentials);

        var newPasswordLoginResponse = await Client.PostJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = session.User.Email,
            Password = newPassword
        });

        newPasswordLoginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        newPasswordLoginResponse.GetSetCookieHeaders()
            .ExtractCookieValue("accessToken")
            .Should()
            .NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task ProtectedEndpoints_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var changePasswordResponse = await Client.PutJsonAsync("/api/auth/password", new PasswordChangeRequest
        {
            CurrentPassword = TestDatabaseExtensions.DefaultUserPassword,
            NewPassword = "NewPassword123!"
        });

        changePasswordResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var logoutResponse = await Client.PostAsync("/api/auth/logout", null);

        logoutResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    private async Task<AuthSession> CreateLoggedInSessionAsync()
    {
        var user = await Factory.SeedUserAsync();

        var response = await Client.PostJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = user.Email,
            Password = TestDatabaseExtensions.DefaultUserPassword
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var cookies = response.GetSetCookieHeaders();
        var accessToken = cookies.ExtractCookieValue("accessToken");
        var refreshToken = cookies.ExtractCookieValue("refreshToken");

        accessToken.Should().NotBeNullOrWhiteSpace();
        refreshToken.Should().NotBeNullOrWhiteSpace();

        return new AuthSession(user, accessToken!, refreshToken!);
    }

    private sealed record AuthSession(
        User User,
        string AccessToken,
        string RefreshToken);
}