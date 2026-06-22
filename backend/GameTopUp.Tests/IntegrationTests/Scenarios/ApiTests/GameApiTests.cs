using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Games;
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
    public async Task GetGames_ShouldReturnGames()
    {
        var activeGame = await Factory.SeedGameAsync();
        await Factory.SeedGamePackageAsync(activeGame.Id);
        await Factory.SeedGameAsync(game => game.IsActive = false);

        var response = await Client.GetAsync("/api/games");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.ReadApiResponseAsync<List<GameResponse>>();

        body.Success.Should().BeTrue();
        body.Data.Should().NotBeNull();

        var result = body.Data!
            .Should()
            .ContainSingle()
            .Subject;

        result.Id.Should().Be(activeGame.Id);
        result.Name.Should().Be(activeGame.Name);
        result.ActivePackages.Should().Be(1);
    }

    [Fact]
    public async Task GetGameById_ShouldReturnGame_WhenExists()
    {
        var game = await Factory.SeedGameAsync();
        await Factory.SeedGamePackageAsync(game.Id);

        var response = await Client.GetAsync($"/api/games/{game.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.ReadApiResponseAsync<GameResponse>();

        body.Success.Should().BeTrue();
        body.Data.Should().NotBeNull();

        body.Data!.Id.Should().Be(game.Id);
        body.Data.Name.Should().Be(game.Name);
        body.Data.ActivePackages.Should().Be(1);
    }

    [Fact]
    public async Task GetGameById_ShouldReturnNotFound_WhenGameIsInactive()
    {
        var game = await Factory.SeedGameAsync(g => g.IsActive = false);

        var response = await Client.GetAsync($"/api/games/{game.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var body = await response.ReadApiResponseAsync<object>();

        body.Success.Should().BeFalse();
        body.ErrorCode.Should().Be(ErrorCode.GameNotFound);
    }

    [Fact]
    public async Task GetGameById_ShouldReturnNotFound_WhenGameDoesNotExist()
    {
        var response = await Client.GetAsync("/api/games/999999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var body = await response.ReadApiResponseAsync<object>();

        body.Success.Should().BeFalse();
        body.ErrorCode.Should().Be(ErrorCode.GameNotFound);
    }
}
