using System.Net;
using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class GameApiTests : BaseIntegrationTest
{
    public GameApiTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetGames_ShouldExcludeInactiveGames()
    {
        var activeGame = await Factory.SeedGameAsync(game =>
        {
            game.ImageUrl = "/legacy/game.png";
            game.ImageRelativePath = "/uploads/games/2026/06/game.png";
        });
        await Factory.SeedPackageAsync(activeGame.Id);
        await Factory.SeedGameAsync(game => game.IsActive = false);

        var response = await Client.GetAsync("/api/games");

        var games = await response.ShouldBeSuccess<List<GameResponse>>();

        var game = games.Should().ContainSingle().Subject;

        game.Id.Should().Be(activeGame.Id);
        game.Name.Should().Be(activeGame.Name);
        game.ImageUrl.Should().Be("https://api.test.local/uploads/games/2026/06/game.png");
        game.ActivePackages.Should().Be(1);
    }

    [Fact]
    public async Task GetGameById_ShouldReturnGame_WhenGameHasActivePackages()
    {
        var game = await Factory.SeedGameAsync();
        await Factory.SeedPackageAsync(game.Id);

        var response = await Client.GetAsync($"/api/games/{game.Id}");

        var result = await response.ShouldBeSuccess<GameResponse>();

        result.Id.Should().Be(game.Id);
        result.Name.Should().Be(game.Name);
        result.ActivePackages.Should().Be(1);
    }

    [Fact]
    public async Task GetGameById_ShouldReturnNotFound_WhenGameHasNoActivePackages()
    {
        var game = await Factory.SeedGameAsync();

        var response = await Client.GetAsync($"/api/games/{game.Id}");

        await response.ShouldHaveError(HttpStatusCode.NotFound, ErrorCode.GameNotFound);
    }

    [Fact]
    public async Task GetGameById_ShouldReturnNotFound_WhenGameIsInactive()
    {
        var game = await Factory.SeedGameAsync(g => g.IsActive = false);

        var response = await Client.GetAsync($"/api/games/{game.Id}");

        await response.ShouldHaveError(HttpStatusCode.NotFound, ErrorCode.GameNotFound);
    }

    [Fact]
    public async Task GetGameById_ShouldReturnNotFound_WhenGameDoesNotExist()
    {
        var response = await Client.GetAsync("/api/games/999999");

        await response.ShouldHaveError(HttpStatusCode.NotFound, ErrorCode.GameNotFound);
    }
}
