using System.Net;
using System.Text;
using FluentAssertions;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using GameTopUp.Tests.IntegrationTests.Support;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.Games;

[Collection("Integration")]
public sealed class GameManagementTests : BaseIntegrationTest
{
    public GameManagementTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [DockerFact]
    public async Task AdminShouldCreateUpdateAndDeleteGameWithImage()
    {
        var admin = await Factory.SeedAdminAsync();
        using var client = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var createResponse = await client.PostMultipartAsync("/api/admin/games",
            new Dictionary<string, string>
            {
                ["Name"] = "  Mobile Legends  ",
                ["IsActive"] = "true"
            },
            CreateImagePart("image/png", Encoding.UTF8.GetBytes("png-bytes")));

        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var createBody = await createResponse.ReadApiResponseAsync<Game>();
        createBody.Success.Should().BeTrue();
        createBody.Data.Should().NotBeNull();
        createBody.Data!.Name.Should().Be("Mobile Legends");
        createBody.Data.ImageUrl.Should().NotBeNullOrWhiteSpace();
        createBody.Data.ImageRelativePath.Should().NotBeNullOrWhiteSpace();

        var imageResponse = await client.GetAsync(createBody.Data.ImageRelativePath);
        imageResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        imageResponse.Content.Headers.ContentType?.MediaType.Should().Be("image/png");

        var updateResponse = await client.PutMultipartAsync($"/api/admin/games/{createBody.Data.Id}",
            new Dictionary<string, string>
            {
                ["Name"] = "  MLBB  ",
                ["IsActive"] = "false"
            },
            CreateImagePart("image/png", Encoding.UTF8.GetBytes("new-bytes")));

        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var updateBody = await updateResponse.ReadApiResponseAsync<Game>();
        updateBody.Data.Should().NotBeNull();
        updateBody.Data!.Name.Should().Be("MLBB");
        updateBody.Data.IsActive.Should().BeFalse();
        updateBody.Data.ImageUrl.Should().NotBe(createBody.Data.ImageUrl);

        var deleteResponse = await client.DeleteAsync($"/api/admin/games/{createBody.Data.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var getResponse = await client.GetAsync($"/api/games/{createBody.Data.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [DockerFact]
    public async Task AdminGamesListShouldIncludePackageCountAndInactiveGames()
    {
        var admin = await Factory.SeedAdminAsync();
        var activeGame = await Factory.SeedGameAsync(name: "Active Game");
        var inactiveGame = await Factory.SeedGameAsync(name: "Inactive Game", isActive: false);
        await Factory.SeedGamePackageAsync(activeGame.Id, salePrice: 1000m, stockQuantity: 2);
        await Factory.SeedGamePackageAsync(activeGame.Id, salePrice: 1500m, stockQuantity: 1);
        await Factory.SeedGamePackageAsync(inactiveGame.Id, salePrice: 2000m, stockQuantity: 1);

        using var client = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var response = await client.GetAsync("/api/admin/games");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.ReadApiResponseAsync<List<AdminGameSummaryResponse>>();
        body.Success.Should().BeTrue();
        body.Data.Should().Contain(game => game.Id == activeGame.Id && game.PackageCount == 2);
        body.Data.Should().Contain(game => game.Id == inactiveGame.Id && game.PackageCount == 1);
    }

    [DockerFact]
    public async Task AdminShouldListAllGamePackages()
    {
        var admin = await Factory.SeedAdminAsync();
        var game = await Factory.SeedGameAsync();
        await Factory.SeedGamePackageAsync(game.Id, salePrice: 1000m, stockQuantity: 2);

        using var client = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var response = await client.GetAsync("/api/admin/game-packages");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.ReadApiResponseAsync<List<GamePackage>>();
        body.Success.Should().BeTrue();
        body.Data.Should().NotBeNull();
        body.Data!.Should().ContainSingle(item => item.GameId == game.Id);
    }

    [DockerFact]
    public async Task MemberShouldBeForbidden_WhenCreatingGameOrPackage()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        var game = await Factory.SeedGameAsync();
        using var client = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var createGameResponse = await client.PostMultipartAsync("/api/admin/games",
            new Dictionary<string, string>
            {
                ["Name"] = "Restricted Game",
                ["IsActive"] = "true"
            },
            CreateImagePart("image/png", Encoding.UTF8.GetBytes("png-bytes")));
        createGameResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var createPackageResponse = await client.PostMultipartAsync("/api/admin/game-packages",
            new Dictionary<string, string>
            {
                ["Name"] = "Restricted Package",
                ["GameId"] = game.Id.ToString(),
                ["SalePrice"] = "1000",
                ["OriginalPrice"] = "900",
                ["ImportPrice"] = "800",
                ["StockQuantity"] = "1",
                ["IsActive"] = "true"
            },
            CreateImagePart("image/png", Encoding.UTF8.GetBytes("png-bytes")));
        createPackageResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [DockerFact]
    public async Task CreatingGameWithUnsupportedImageType_ShouldReturnBadRequest()
    {
        var admin = await Factory.SeedAdminAsync();
        using var client = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var response = await client.PostMultipartAsync("/api/admin/games",
            new Dictionary<string, string>
            {
                ["Name"] = "Unsupported Image Game",
                ["IsActive"] = "true"
            },
            CreateImagePart("text/plain", Encoding.UTF8.GetBytes("plain-text")));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.ReadApiResponseAsync<object>();
        body.Success.Should().BeFalse();
        body.ErrorCode.Should().Be(ErrorCode.UnsupportedImageType.ToString());
    }

    [DockerFact]
    public async Task CreatingPackageForInactiveGame_ShouldReturnBadRequest()
    {
        var admin = await Factory.SeedAdminAsync();
        var inactiveGame = await Factory.SeedGameAsync(isActive: false);
        using var client = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var response = await client.PostMultipartAsync("/api/admin/game-packages",
            new Dictionary<string, string>
            {
                ["Name"] = "Inactive Game Package",
                ["GameId"] = inactiveGame.Id.ToString(),
                ["SalePrice"] = "1000",
                ["OriginalPrice"] = "900",
                ["ImportPrice"] = "800",
                ["StockQuantity"] = "1",
                ["IsActive"] = "true"
            },
            CreateImagePart("image/png", Encoding.UTF8.GetBytes("png-bytes")));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.ReadApiResponseAsync<object>();
        body.Success.Should().BeFalse();
        body.ErrorCode.Should().Be(ErrorCode.InactiveGameCannotAddPackage.ToString());
    }

    [DockerFact]
    public async Task UpdatingPackageWithNegativeStock_ShouldReturnBadRequest()
    {
        var admin = await Factory.SeedAdminAsync();
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedGamePackageAsync(game.Id, salePrice: 1000m, stockQuantity: 2);
        using var client = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var response = await client.PutMultipartAsync($"/api/admin/game-packages/{package.Id}",
            new Dictionary<string, string>
            {
                ["StockQuantity"] = "-1"
            },
            CreateImagePart("image/png", Encoding.UTF8.GetBytes("png-bytes")));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.ReadApiResponseAsync<object>();
        body.Success.Should().BeFalse();
        body.ErrorCode.Should().Be(ErrorCode.StockQuantityMustBePositive.ToString());
    }

    private static ByteArrayContent CreateImagePart(string contentType, byte[] bytes)
    {
        var part = new ByteArrayContent(bytes);
        part.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
        return part;
    }
}
