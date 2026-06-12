using System.Net;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.DTOs.Users;
using FluentAssertions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using GameTopUp.Tests.IntegrationTests.Support;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.Auth;

[Collection("Integration")]
public sealed class AuthFlowTests : BaseIntegrationTest
{
    public AuthFlowTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [DockerFact]
    public async Task RegisterAndLogin_ShouldSetAuthCookies_WhenCredentialsAreValid()
    {
        var email = $"register-{TestDatabaseExtensions.UniqueCode()}@test.local";
        var password = "Password123!";

        var registerResponse = await Client.PostJsonAsync("/api/auth/register", new CreateUserRequest
        {
            DisplayName = "Register Flow User",
            Email = email,
            Password = password
        });

        registerResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var registerBody = await registerResponse.ReadApiResponseAsync<object>();
        registerBody.Success.Should().BeTrue();

        var loginResponse = await Client.PostJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = email,
            Password = password
        });

        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        loginResponse.Headers.TryGetValues("Set-Cookie", out var setCookies).Should().BeTrue();
        setCookies.Should().Contain(cookie => cookie.Contains("accessToken=", StringComparison.OrdinalIgnoreCase));
        setCookies.Should().Contain(cookie => cookie.Contains("refreshToken=", StringComparison.OrdinalIgnoreCase));

        var loginBody = await loginResponse.ReadApiResponseAsync<LoginResponseBody>();
        loginBody.Success.Should().BeTrue();
        loginBody.Data.Should().NotBeNull();
        loginBody.Data!.User.Should().NotBeNull();
        loginBody.Data.User!.Email.Should().Be(email);
    }

    public sealed class LoginResponseBody
    {
        public UserResponseDTO? User { get; set; }
    }
}
