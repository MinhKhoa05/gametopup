using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.DAL.Entities;
using Xunit;

using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios
{
    [Collection("IntegrationTests")]
    public class GamePackageApiTests : BaseIntegrationTest
    {
        public GamePackageApiTests(CustomWebApplicationFactory<Program> factory) : base(factory)
        {
        }

        [Fact]
        public async Task CreatePackage_ShouldReturnCreated_WhenDataIsValid()
        {
            // Arrange
            var admin = await Factory.SeedUserAsync("admin_pack", u => u.Role = UserRole.Admin);
            var game = await Factory.SeedGameAsync("Active Game For Package");
            var createDto = new CreateGamePackageRequest 
            { 
                GameId = game.Id, 
                Name = "Gói 100K", 
                SalePrice = 100000,
                ImportPrice = 70000,
                IsActive = true
            };

            // Act
            var request = new HttpRequestMessage(HttpMethod.Post, "/api/game-packages")
                .WithTestAuth(admin.Id, "Admin")
                .WithJson(createDto);
            var response = await Client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var package = await response.ReadDataAsync<GamePackage>();
            package.Should().NotBeNull();
            package!.Name.Should().Be("Gói 100K");
            package.NormalizedName.Should().Be("goi 100k");
        }

        [Fact]
        public async Task GetPackagesByGameId_ShouldReturnOnlyActivePackages()
        {
            // Arrange
            var game = await Factory.SeedGameAsync("Game with many packages");
            
            // Seed 1 active package directly in DB
            await Factory.SeedGamePackageAsync(game.Id, "Active Pack", customize: p => p.IsActive = true);
            
            // Seed 1 inactive package directly in DB
            await Factory.SeedGamePackageAsync(game.Id, "Inactive Pack", customize: p => p.IsActive = false);

            var response = await Client.GetAsync($"/api/game-packages/game/{game.Id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var packages = await response.ReadDataAsync<List<GamePackage>>();
            packages.Should().HaveCount(1);
            packages!.All(p => p.IsActive).Should().BeTrue();
            packages.First().Name.Should().Be("Active Pack");
        }

        [Fact]
        public async Task DeletePackage_ShouldPerformHardDelete()
        {
            // Arrange
            var admin = await Factory.SeedUserAsync("admin_del_pack", u => u.Role = UserRole.Admin);
            var game = await Factory.SeedGameAsync("Game for Delete Pack");
            var package = await Factory.SeedGamePackageAsync(game.Id, "To Be Deleted");

            // Act
            var request = new HttpRequestMessage(HttpMethod.Delete, $"/api/game-packages/{package.Id}")
                .WithTestAuth(admin.Id, "Admin");
            var response = await Client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            // Verify hard delete by trying to get it (Public endpoint)
            var getResponse = await Client.GetAsync($"/api/game-packages/{package.Id}");
            getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
