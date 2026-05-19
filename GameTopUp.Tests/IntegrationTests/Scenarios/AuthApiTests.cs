using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.API;
using Xunit;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios
{
    [Collection("IntegrationTests")]
    public class AuthApiTests : IAsyncLifetime
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<Program> _factory;

        public AuthApiTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        public async Task InitializeAsync()
        {
            await _factory.ResetDatabaseAsync();
        }

        public Task DisposeAsync()
        {
            return Task.CompletedTask;
        }

        [Fact]
        public async Task Register_ShouldCreateUser_WhenDataIsValid()
        {
            // Arrange
            var registerRequest = new CreateUserRequest
            {
                Name = "testregister",
                Email = "testregister@test.com",
                Password = "Password123!"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            var content = await response.Content.ReadAsStringAsync();
            response.StatusCode.Should().Be(HttpStatusCode.Created, $"Register failed: {content}");
        }

        [Fact]
        public async Task Login_ShouldSetCookieAndReturnAccessToken_WhenCredentialsAreValid()
        {
            // Arrange - Register the user first
            var registerRequest = new CreateUserRequest
            {
                Name = "testlogin",
                Email = "testlogin@test.com",
                Password = "Password123!"
            };
            await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            var loginRequest = new LoginRequest
            {
                Email = "testlogin@test.com",
                Password = "Password123!"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            // Verify Cookie
            response.Headers.Contains("Set-Cookie").Should().BeTrue();
            var setCookieHeader = response.Headers.GetValues("Set-Cookie").FirstOrDefault();
            setCookieHeader.Should().NotBeNull();
            setCookieHeader.Should().Contain("refreshToken=");

            // Verify body
            var result = await response.Content.ReadFromJsonAsync<ApiResponseTestWrapper<AuthResponseDTO>>();
            result!.Success.Should().BeTrue();
            result.Data!.AccessToken.Should().NotBeNullOrEmpty();
            result.Data.RefreshToken.Should().BeNullOrEmpty(); // RefreshToken must be kept in cookie, not body
        }

        [Fact]
        public async Task Login_ShouldReturnBadRequest_WhenPasswordIncorrect()
        {
            // Arrange - Register the user first
            var registerRequest = new CreateUserRequest
            {
                Name = "testloginbad",
                Email = "testloginbad@test.com",
                Password = "Password123!"
            };
            await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            var loginRequest = new LoginRequest
            {
                Email = "testloginbad@test.com",
                Password = "WrongPassword!"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            var result = await response.Content.ReadFromJsonAsync<ApiResponseTestWrapper<object>>();
            result!.Success.Should().BeFalse();
            result.Message.Should().Be("Email hoặc mật khẩu không chính xác.");
        }

        [Fact]
        public async Task Refresh_ShouldReturnNewTokens_WhenValidCookieProvided()
        {
            // Arrange - Register and Login to get the cookie
            var registerRequest = new CreateUserRequest
            {
                Name = "testrefresh",
                Email = "testrefresh@test.com",
                Password = "Password123!"
            };
            await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            var loginRequest = new LoginRequest
            {
                Email = "testrefresh@test.com",
                Password = "Password123!"
            };
            var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
            var setCookieHeader = loginResponse.Headers.GetValues("Set-Cookie").FirstOrDefault();
            var cookieParts = setCookieHeader!.Split(';');
            var tokenPart = cookieParts.FirstOrDefault(p => p.Trim().StartsWith("refreshToken="));
            var refreshTokenValue = tokenPart!.Split('=')[1];

            var refreshRequestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
            refreshRequestMessage.Headers.Add("Cookie", $"refreshToken={refreshTokenValue}");

            // Act
            var response = await _client.SendAsync(refreshRequestMessage);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Verify new Cookie is set and different
            response.Headers.Contains("Set-Cookie").Should().BeTrue();
            var newSetCookieHeader = response.Headers.GetValues("Set-Cookie").FirstOrDefault();
            newSetCookieHeader.Should().NotBeNull();
            newSetCookieHeader.Should().Contain("refreshToken=");
            var newCookieParts = newSetCookieHeader!.Split(';');
            var newTokenPart = newCookieParts.FirstOrDefault(p => p.Trim().StartsWith("refreshToken="));
            var newRefreshTokenValue = newTokenPart!.Split('=')[1];
            newRefreshTokenValue.Should().NotBe(refreshTokenValue);

            // Verify new access token in body
            var result = await response.Content.ReadFromJsonAsync<ApiResponseTestWrapper<AuthResponseDTO>>();
            result!.Success.Should().BeTrue();
            result.Data!.AccessToken.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async Task Refresh_ShouldReturnBadRequest_WhenInvalidCookieProvided()
        {
            // Arrange
            var refreshRequestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
            refreshRequestMessage.Headers.Add("Cookie", "refreshToken=invalidtoken123");

            // Act
            var response = await _client.SendAsync(refreshRequestMessage);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            var result = await response.Content.ReadFromJsonAsync<ApiResponseTestWrapper<object>>();
            result!.Success.Should().BeFalse();
            result.Message.Should().Be("Refresh Token không hợp lệ.");
        }

        [Fact]
        public async Task Logout_ShouldClearCookieAndRevokeToken_WhenAuthorized()
        {
            // Arrange - Register and Login to get accessToken and refreshToken
            var registerRequest = new CreateUserRequest
            {
                Name = "testlogout",
                Email = "testlogout@test.com",
                Password = "Password123!"
            };
            await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            var loginRequest = new LoginRequest
            {
                Email = "testlogout@test.com",
                Password = "Password123!"
            };
            var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
            var setCookieHeader = loginResponse.Headers.GetValues("Set-Cookie").FirstOrDefault();
            var cookieParts = setCookieHeader!.Split(';');
            var tokenPart = cookieParts.FirstOrDefault(p => p.Trim().StartsWith("refreshToken="));
            var refreshTokenValue = tokenPart!.Split('=')[1];

            var loginData = await loginResponse.Content.ReadFromJsonAsync<ApiResponseTestWrapper<AuthResponseDTO>>();
            var accessToken = loginData!.Data!.AccessToken;

            var logoutRequestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout");
            logoutRequestMessage.Headers.Add("Cookie", $"refreshToken={refreshTokenValue}");
            logoutRequestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");

            // Act
            var response = await _client.SendAsync(logoutRequestMessage);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Verify cookie is deleted/cleared in response
            response.Headers.Contains("Set-Cookie").Should().BeTrue();
            var deleteCookieHeader = response.Headers.GetValues("Set-Cookie").FirstOrDefault();
            deleteCookieHeader.Should().NotBeNull();
            deleteCookieHeader.Should().Contain("refreshToken=");
            (deleteCookieHeader!.Contains("refreshToken=;") || deleteCookieHeader.Contains("expires=")).Should().BeTrue();
        }
    }
}
