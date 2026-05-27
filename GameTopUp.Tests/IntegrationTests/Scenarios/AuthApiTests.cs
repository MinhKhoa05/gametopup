using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.DTOs.Users;
using Xunit;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios
{
    [Collection("IntegrationTests")]
    public class AuthApiTests : BaseIntegrationTest
    {
        public AuthApiTests(CustomWebApplicationFactory<Program> factory) : base(factory)
        {
        }

        [Fact]
        public async Task Register_ShouldCreateUser_WhenDataIsValid()
        {
            // Act
            var response = await RegisterAsync("testregister", "testregister@test.com", "Password123!");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
        }

        [Fact]
        public async Task Login_ShouldSetHttpOnlyCookiesAndHideTokens_WhenCredentialsAreValid()
        {
            // Arrange
            await RegisterAsync("testlogin", "testlogin@test.com", "Password123!");

            // Act
            var response = await LoginAsync("testlogin@test.com", "Password123!");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.GetCookie("accessToken").Should().NotBeEmpty();
            response.GetCookie("refreshToken").Should().NotBeEmpty();

            response.Headers.GetValues("Set-Cookie")
                .Should().Contain(cookie => cookie.Contains("accessToken=")
                    && cookie.Contains("httponly", StringComparison.OrdinalIgnoreCase)
                    && cookie.Contains("samesite=lax", StringComparison.OrdinalIgnoreCase));

            var result = await response.Content.ReadFromJsonAsync<ApiResponseTestWrapper<AuthResponseDTO>>();
            result!.Success.Should().BeTrue();
            result.Data!.AccessToken.Should().BeNullOrEmpty();
            result.Data.RefreshToken.Should().BeNullOrEmpty();
            result.Data.User.Should().NotBeNull();
        }

        [Fact]
        public async Task Login_ShouldReturnBadRequest_WhenPasswordIncorrect()
        {
            // Arrange
            await RegisterAsync("testloginbad", "testloginbad@test.com", "Password123!");

            // Act
            var response = await LoginAsync("testloginbad@test.com", "WrongPassword!");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            var result = await response.Content.ReadFromJsonAsync<ApiResponseTestWrapper<object>>();
            result!.Success.Should().BeFalse();
            result.Message.Should().Be("Email hoặc mật khẩu không chính xác.");
        }

        [Fact]
        public async Task Refresh_ShouldReturnNewTokens_WhenValidCookieProvided()
        {
            // Arrange - Register & Login to get the cookie via private helper
            var authInfo = await RegisterAndLoginAsync("testrefresh", "testrefresh@test.com", "Password123!");
            var refreshToken = authInfo.RefreshToken;

            // Act - Send refresh request with Cookie using the fluent extension WithCookie
            var response = await Client.SendAsync(new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh")
                .WithCookie("refreshToken", refreshToken));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var newRefreshToken = response.GetCookie("refreshToken");
            newRefreshToken.Should().NotBeNullOrEmpty().And.NotBe(refreshToken);
            response.GetCookie("accessToken").Should().NotBeNullOrEmpty();

            var result = await response.Content.ReadFromJsonAsync<ApiResponseTestWrapper<AuthResponseDTO>>();
            result!.Success.Should().BeTrue();
            result.Data!.AccessToken.Should().BeNullOrEmpty();
        }

        [Fact]
        public async Task Refresh_ShouldReturnBadRequest_WhenInvalidCookieProvided()
        {
            // Act - Send refresh request with invalid cookie using WithCookie
            var response = await Client.SendAsync(new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh")
                .WithCookie("refreshToken", "invalidtoken123"));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            var result = await response.Content.ReadFromJsonAsync<ApiResponseTestWrapper<object>>();
            result!.Success.Should().BeFalse();
            result.Message.Should().Be("Refresh Token không hợp lệ.");
        }

        [Fact]
        public async Task Logout_ShouldClearCookieAndRevokeToken_WhenAuthorized()
        {
            // Arrange - Register & Login via private helper
            var authInfo = await RegisterAndLoginAsync("testlogout", "testlogout@test.com", "Password123!");

            // Act - Send logout using standard HttpClient extensions WithCookie and WithTestAuth
            var response = await Client.SendAsync(new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout")
                .WithCookie("refreshToken", authInfo.RefreshToken)
                .WithTestAuth(authInfo.User!.Id, "Member", authInfo.User.Username));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var cookieHeaders = response.Headers.GetValues("Set-Cookie").ToList();
            cookieHeaders.Should().Contain(cookie => cookie.Contains("accessToken=") && cookie.Contains("expires=", StringComparison.OrdinalIgnoreCase));
            cookieHeaders.Should().Contain(cookie => cookie.Contains("refreshToken=") && cookie.Contains("expires=", StringComparison.OrdinalIgnoreCase));
        }

        #region PRIVATE AUTH HELPERS

        private async Task<HttpResponseMessage> RegisterAsync(string username, string email, string password)
        {
            var registerRequest = new CreateUserRequest
            {
                Name = username,
                Email = email,
                Password = password
            };
            return await Client.PostAsJsonAsync("/api/auth/register", registerRequest);
        }

        private async Task<HttpResponseMessage> LoginAsync(string email, string password)
        {
            var loginRequest = new LoginRequest
            {
                Email = email,
                Password = password
            };
            return await Client.PostAsJsonAsync("/api/auth/login", loginRequest);
        }

        private async Task<AuthResponseDTO> RegisterAndLoginAsync(
            string username,
            string email, 
            string password)
        {
            var regResponse = await RegisterAsync(username, email, password);
            regResponse.EnsureSuccessStatusCode();

            var loginResponse = await LoginAsync(email, password);
            loginResponse.EnsureSuccessStatusCode();

            var data = await loginResponse.Content.ReadFromJsonAsync<ApiResponseTestWrapper<AuthResponseDTO>>();
            var dto = data!.Data!;
            dto.RefreshToken = loginResponse.GetCookie("refreshToken");

            return dto;
        }

        #endregion
    }
}
