using System.Net;
using System.Net.Http.Headers;
using FluentAssertions;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using GameTopUp.Tests.IntegrationTests.Support;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.Games;

[Collection("Integration")]
public sealed class GamePackageFlowTests : BaseIntegrationTest
{
    public GamePackageFlowTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [DockerFact]
    public async Task GetPackagesByGameId_ShouldReturnOnlyActivePackagesForThatGame()
    {
        var game = await Factory.SeedGameAsync();
        var otherGame = await Factory.SeedGameAsync();
        var activePackage = await Factory.SeedGamePackageAsync(game.Id, salePrice: 100m, stockQuantity: 5, isActive: true);
        await Factory.SeedGamePackageAsync(game.Id, salePrice: 150m, stockQuantity: 2, isActive: false);
        await Factory.SeedGamePackageAsync(otherGame.Id, salePrice: 200m, stockQuantity: 1, isActive: true);

        var response = await Client.GetAsync($"/api/games/{game.Id}/packages");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.ReadApiResponseAsync<List<PublicGamePackageResponse>>();
        body.Success.Should().BeTrue();
        body.Data.Should().ContainSingle(package => package.Id == activePackage.Id && package.IsAvailable && package.StockStatus == "in_stock");
    }

    [DockerFact]
    public async Task GetPackageById_ShouldReturnNotFound_WhenPackageDoesNotExist()
    {
        var response = await Client.GetAsync("/api/game-packages/999999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [DockerFact]
    public async Task AdminShouldCreateUpdateAndDeletePackage()
    {
        var admin = await Factory.SeedAdminAsync();
        var game = await Factory.SeedGameAsync();
        using var client = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var createResponse = await client.PostMultipartAsync("/api/admin/game-packages",
            new Dictionary<string, string>
            {
                ["Name"] = "  VIP Pack  ",
                ["GameId"] = game.Id.ToString(),
                ["SalePrice"] = "1000",
                ["OriginalPrice"] = "900",
                ["ImportPrice"] = "800",
                ["StockQuantity"] = "3",
                ["IsActive"] = "true"
            },
            CreateImagePart("image/png", new byte[] { 1, 2, 3 }));

        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var createBody = await createResponse.ReadApiResponseAsync<GamePackage>();
        createBody.Data.Should().NotBeNull();
        createBody.Data!.Name.Should().Be("VIP Pack");
        createBody.Data.StockQuantity.Should().Be(3);

        var updateResponse = await client.PutMultipartAsync($"/api/admin/game-packages/{createBody.Data.Id}",
            new Dictionary<string, string>
            {
                ["Name"] = "  VIP Plus  ",
                ["StockQuantity"] = "5",
                ["IsActive"] = "false"
            },
            CreateImagePart("image/png", new byte[] { 4, 5, 6 }));

        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var updateBody = await updateResponse.ReadApiResponseAsync<GamePackage>();
        updateBody.Data.Should().NotBeNull();
        updateBody.Data!.Name.Should().Be("VIP Plus");
        updateBody.Data.StockQuantity.Should().Be(5);
        updateBody.Data.IsActive.Should().BeFalse();

        var deleteResponse = await client.DeleteAsync($"/api/admin/game-packages/{createBody.Data.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var getResponse = await Client.GetAsync($"/api/game-packages/{createBody.Data.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [DockerFact]
    public async Task MemberShouldBeForbidden_WhenCreatingUpdatingOrDeletingPackage()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedGamePackageAsync(game.Id, salePrice: 100m, stockQuantity: 1);
        using var client = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var createResponse = await client.PostMultipartAsync("/api/admin/game-packages",
            new Dictionary<string, string>
            {
                ["Name"] = "Member Pack",
                ["GameId"] = game.Id.ToString(),
                ["SalePrice"] = "100",
                ["OriginalPrice"] = "90",
                ["ImportPrice"] = "80",
                ["StockQuantity"] = "1",
                ["IsActive"] = "true"
            },
            CreateImagePart("image/png", new byte[] { 7, 8, 9 }));
        createResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var updateResponse = await client.PutMultipartAsync($"/api/admin/game-packages/{package.Id}",
            new Dictionary<string, string>
            {
                ["Name"] = "Hacked"
            },
            CreateImagePart("image/png", new byte[] { 7, 8, 9 }));
        updateResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var deleteResponse = await client.DeleteAsync($"/api/admin/game-packages/{package.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    private static ByteArrayContent CreateImagePart(string contentType, byte[] bytes)
    {
        var part = new ByteArrayContent(bytes);
        part.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        return part;
    }
}
