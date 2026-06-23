using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class AuthApiTests : BaseIntegrationTest
{
    public AuthApiTests(CustomWebApplicationFactory factory) : base(factory)
    {
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

        var auth = await response.ShouldBeSuccess<AuthResponse>();

        auth.User.Should().NotBeNull();
        auth.User!.Email.Should().Be(user.Email);

        var cookies = response.GetSetCookieHeaders();

        GetRequiredCookie(cookies, "accessToken");
        GetRequiredCookie(cookies, "refreshToken");
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

        await response.ShouldHaveError(HttpStatusCode.Unauthorized, ErrorCode.InvalidCredentials);

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

        await response.ShouldBeSuccess();

        var cookies = response.GetSetCookieHeaders();

        var rotatedAccessToken = GetRequiredCookie(cookies, "accessToken");
        var rotatedRefreshToken = GetRequiredCookie(cookies, "refreshToken");

        rotatedAccessToken.Should().NotBe(session.AccessToken);
        rotatedRefreshToken.Should().NotBe(session.RefreshToken);

        using var reusedClient = CreateClient();
        reusedClient.ReplaceCookieHeader($"refreshToken={session.RefreshToken}");

        var reusedResponse = await reusedClient.PostAsync("/api/auth/refresh", null);
        await response.ShouldHaveError(HttpStatusCode.Unauthorized, ErrorCode.InvalidRefreshToken);
    }

    [Fact]
    public async Task Refresh_ShouldReturnUnauthorized_WhenRefreshCookieIsMissing()
    {
        var response = await Client.PostAsync("/api/auth/refresh", null);
        await response.ShouldHaveError(HttpStatusCode.Unauthorized, ErrorCode.InvalidRefreshToken);
    }

    [Fact]
    public async Task Logout_ShouldClearSessionCookies_AndInvalidateRefreshToken()
    {
        var session = await CreateLoggedInSessionAsync();

        using var client = CreateHeaderAuthenticatedClient(session.User);
        client.ReplaceCookieHeader($"refreshToken={session.RefreshToken}");

        var response = await client.PostAsync("/api/auth/logout", null);

        await response.ShouldBeSuccess();

        var cookies = response.GetSetCookieHeaders();

        ShouldContainExpiredCookie(cookies, "accessToken");
        ShouldContainExpiredCookie(cookies, "refreshToken");

        using var refreshAfterLogoutClient = CreateClient();
        refreshAfterLogoutClient.ReplaceCookieHeader($"refreshToken={session.RefreshToken}");

        var refreshAfterLogoutResponse = await refreshAfterLogoutClient.PostAsync("/api/auth/refresh", null);

        await response.ShouldHaveError(HttpStatusCode.Unauthorized, ErrorCode.InvalidRefreshToken);
    }

    [Fact]
    public async Task ChangePassword_ShouldUpdatePassword_AndRequireNewPassword()
    {
        var session = await CreateLoggedInSessionAsync();

        const string newPassword = "NewPassword123!";

        using var client = CreateHeaderAuthenticatedClient(session.User);

        var response = await client.PutJsonAsync("/api/auth/password",
            new PasswordChangeRequest
            {
                CurrentPassword = TestDatabaseExtensions.DefaultUserPassword,
                NewPassword = newPassword
            });

        await response.ShouldBeSuccess();

        var oldPasswordLoginResponse = await LoginAsync(session.User.Email, TestDatabaseExtensions.DefaultUserPassword);
        await oldPasswordLoginResponse.ShouldHaveError(HttpStatusCode.Unauthorized, ErrorCode.InvalidCredentials);

        var newPasswordLoginResponse = await LoginAsync(session.User.Email, newPassword);
        await newPasswordLoginResponse.ShouldBeSuccess<AuthResponse>();
        GetRequiredCookie(newPasswordLoginResponse.GetSetCookieHeaders(), "accessToken");
    }

    [Fact]
    public async Task ProtectedEndpoints_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var changePasswordResponse = await Client.PutJsonAsync("/api/auth/password",
            new PasswordChangeRequest
            {
                CurrentPassword = TestDatabaseExtensions.DefaultUserPassword,
                NewPassword = "NewPassword123!"
            });

        await changePasswordResponse.ShouldHaveError(HttpStatusCode.Unauthorized);

        var logoutResponse = await Client.PostAsync("/api/auth/logout", null);

        await logoutResponse.ShouldHaveError(HttpStatusCode.Unauthorized);
    }

    private async Task<AuthSession> CreateLoggedInSessionAsync()
    {
        var user = await Factory.SeedUserAsync();

        var response = await Client.PostJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = user.Email,
            Password = TestDatabaseExtensions.DefaultUserPassword
        });

        await response.ShouldBeSuccess<AuthResponse>();

        var cookies = response.GetSetCookieHeaders();

        return new AuthSession(
            user,
            GetRequiredCookie(cookies, "accessToken"),
            GetRequiredCookie(cookies, "refreshToken"));
    }

    private sealed record AuthSession(
        User User,
        string AccessToken,
        string RefreshToken);

    private static string GetRequiredCookie(
        IReadOnlyCollection<string> cookies,
        string cookieName)
    {
        var value = cookies.ExtractCookieValue(cookieName);

        value.Should().NotBeNullOrWhiteSpace();

        return value!;
    }

    private static void ShouldContainExpiredCookie(
        IReadOnlyCollection<string> cookies,
        string cookieName)
    {
        cookies.Should().Contain(cookie =>
            cookie.Contains($"{cookieName}=", StringComparison.OrdinalIgnoreCase)
            && cookie.Contains("expires=", StringComparison.OrdinalIgnoreCase));
    }

    private Task<HttpResponseMessage> LoginAsync(
        string email,
        string password)
    {
        return Client.PostJsonAsync("/api/auth/login",
            new LoginRequest
            {
                Email = email,
                Password = password
            });
    }
}