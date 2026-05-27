using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Users;
using Xunit;

using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios
{
    [Collection("IntegrationTests")]
    public class UserApiTests : BaseIntegrationTest
    {
        public UserApiTests(CustomWebApplicationFactory<Program> factory) : base(factory)
        {
        }

        [Fact]
        public async Task GetAllUsers_ShouldReturnWrappedList()
        {
            // Arrange
            var user = await Factory.SeedUserAsync("user_list_1");
            await Factory.SeedUserAsync("user_list_2");

            // Act
            var request = new HttpRequestMessage(HttpMethod.Get, "/api/users")
                .WithTestAuth(user.Id, "Admin");
            var response = await Client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var users = await response.ReadDataAsync<List<UserResponseDTO>>();
            users.Should().NotBeNull();
            users!.Any(u => u.Username == "user_list_1").Should().BeTrue();
        }

        [Fact]
        public async Task GetUserById_ShouldReturnCorrectData_WhenUserExists()
        {
            // Arrange
            var user = await Factory.SeedUserAsync("integration_test_user", u => u.Email = "integration@test.vn");
            var id = user.Id;

            // Act
            var request = new HttpRequestMessage(HttpMethod.Get, $"/api/users/{id}")
                .WithTestAuth(user.Id, "Member");
            var response = await Client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var userResult = await response.ReadDataAsync<UserResponseDTO>();
            userResult.Should().NotBeNull();
            userResult!.Id.Should().Be(id);
            userResult.Username.Should().Be("integration_test_user");
            userResult.Email.Should().Be("integration@test.vn");
        }

        [Fact]
        public async Task GetUserById_ShouldReturnNotFound_WhenUserDoesNotExist()
        {
            // Arrange
            var user = await Factory.SeedUserAsync("temp_user");

            // Act
            var request = new HttpRequestMessage(HttpMethod.Get, "/api/users/9999")
                .WithTestAuth(user.Id, "Member");
            var response = await Client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
            
            var wrapper = await response.ReadAsApiResult<object>();
            wrapper!.Success.Should().BeFalse();
            wrapper.Message.Should().Be("Người dùng không tồn tại.");
        }

        [Fact]
        public async Task UpdateUser_ShouldActuallyUpdateDatabase()
        {
            // Arrange
            var user = await Factory.SeedUserAsync("original_name");
            var id = user.Id;
            var updateDto = new UpdateUserRequest { Username = "updated_name" };

            // Act
            var request = new HttpRequestMessage(HttpMethod.Put, $"/api/users/{id}")
                .WithTestAuth(user.Id, "Member")
                .WithJson(updateDto);
            var response = await Client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var userInDb = await Factory.GetUserAsync(id);
            userInDb!.Username.Should().Be("updated_name");
        }

        [Fact]
        public async Task DeleteUser_ShouldPerformSoftDelete_BySettingIsActiveToFalse()
        {
            // Arrange
            var user = await Factory.SeedUserAsync("soft_delete_me");
            var id = user.Id;

            // Act
            var request = new HttpRequestMessage(HttpMethod.Delete, $"/api/users/{id}")
                .WithTestAuth(user.Id, "Admin");
            var response = await Client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            // Verify in Database
            var userInDb = await Factory.GetUserAsync(id);
            userInDb!.IsActive.Should().BeFalse();
        }
    }
}
