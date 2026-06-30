using System.Net;
using System.Net.Http.Headers;
using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class AdminGameApiTests : BaseIntegrationTest
{
    public AdminGameApiTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetGames_ShouldIncludeInactiveGames_ForAdmin()
    {
        var game = await Factory.SeedGameAsync(g => g.IsActive = false);

        await Factory.SeedPackageAsync(game.Id);

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.GetAsync("/api/admin/games");

        var games = await response.ShouldBeSuccess<List<AdminGameResponse>>();

        games.Should().Contain(x => x.Id == game.Id);
    }

    [Fact]
    public async Task CreateGame_ShouldCreateGame()
    {
        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostMultipartAsync(
            "/api/admin/games",
            new Dictionary<string, string>
            {
                ["Name"] = "  Free Fire  ",
                ["IsActive"] = "false"
            },
            CreateImageContent("image/png", "free-fire.png"));

        var created = await response.ShouldBeSuccess<AdminGameResponse>(HttpStatusCode.Created);

        created.Name.Should().Be("Free Fire");
        created.IsActive.Should().BeFalse();

        var game = await Factory.GetGameAsync(created.Id);

        game.Should().NotBeNull();
        game!.Name.Should().Be("Free Fire");
        game.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task CreateGame_ShouldStoreImage_WhenImageProvided()
    {
        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostMultipartAsync(
            "/api/admin/games",
            new Dictionary<string, string>
            {
                ["Name"] = "Genshin Impact",
                ["IsActive"] = "true"
            },
            CreateImageContent("image/png", "genshin-impact.png"));

        var created = await response.ShouldBeSuccess<AdminGameResponse>(HttpStatusCode.Created);

        created.ImageUrl.Should().NotBeNullOrWhiteSpace();
        created.ImageUrl.Should().StartWith("https://api.test.local/uploads/");

        var game = await Factory.GetGameAsync(created.Id);

        game.Should().NotBeNull();
        game!.ImageUrl.Should().StartWith("/uploads/");
        game.ImageRelativePath.Should().NotBeNullOrWhiteSpace();
        game.ImageRelativePath.Should().NotStartWith("http");
    }

    [Fact]
    public async Task CreateGame_ShouldReturnBadRequest_WhenImageTypeInvalid()
    {
        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostMultipartAsync(
            "/api/admin/games",
            new Dictionary<string, string>
            {
                ["Name"] = "Bad Image Game"
            },
            CreateImageContent("text/plain", "bad-image.txt"));

        await response.ShouldHaveError(HttpStatusCode.BadRequest, ErrorCode.InvalidImageFile);
    }

    [Fact]
    public async Task UpdateGame_ShouldPersistChanges()
    {
        var game = await Factory.SeedGameAsync(g =>
        {
            g.Name = "Old Game";
            g.IsActive = true;
        });

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PutMultipartAsync(
            $"/api/admin/games/{game.Id}",
            new Dictionary<string, string>
            {
                ["Name"] = "  New Game  ",
                ["IsActive"] = "false"
            },
            CreateImageContent("image/png", "new-game.png"));

        await response.ShouldBeSuccess<AdminGameResponse>();

        var updated = await Factory.GetGameAsync(game.Id);

        updated.Should().NotBeNull();
        updated!.Name.Should().Be("New Game");
        updated.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteGame_ShouldRemoveGame()
    {
        var game = await Factory.SeedGameAsync(g =>
        {
            g.Name = "Delete Me";
        });

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.DeleteAsync($"/api/admin/games/{game.Id}");

        await response.ShouldBeSuccess();

        var deletedGame = await Factory.GetGameAsync(game.Id);

        deletedGame.Should().BeNull();
    }

    [Fact]
    public async Task UpdateGame_ShouldReturnNotFound_WhenGameDoesNotExist()
    {
        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PutMultipartAsync(
            "/api/admin/games/999999",
            new Dictionary<string, string>
            {
                ["Name"] = "Ghost Game"
            },
            CreateImageContent("image/png", "ghost.png"));

        await response.ShouldHaveError(HttpStatusCode.NotFound, ErrorCode.GameNotFound);
    }

    [Fact]
    public async Task GetGames_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var response = await Client.GetAsync("/api/admin/games");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetGames_ShouldReturnForbidden_WhenMember()
    {
        var member = await Factory.SeedUserAsync();

        using var client = CreateHeaderAuthenticatedClient(member);

        var response = await client.GetAsync("/api/admin/games");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    private static HttpContent CreateImageContent(
        string contentType,
        string fileName)
    {
        var content = new ByteArrayContent(new byte[] { 1, 2, 3 });

        content.Headers.ContentType =
            new MediaTypeHeaderValue(contentType);

        content.Headers.ContentDisposition =
            new ContentDispositionHeaderValue("form-data")
            {
                Name = "\"ImageFile\"",
                FileName = $"\"{fileName}\""
            };

        return content;
    }
}
