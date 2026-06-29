using System.Net;
using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class GamePackageApiTests : BaseIntegrationTest
{
    public GamePackageApiTests(CustomWebApplicationFactory factory)
    : base(factory)
    {
    }

    [Fact]
    public async Task GetPackagesByGame_ShouldReturnPackagesForRequestedGame()
    {
        var game = await Factory.SeedGameAsync();
        var otherGame = await Factory.SeedGameAsync();

        var package = await Factory.SeedGamePackageAsync(game.Id);

        await Factory.SeedGamePackageAsync(otherGame.Id);

        var response = await Client.GetAsync($"/api/games/{game.Id}/packages");

        var packages = await response.ShouldBeSuccess<List<GamePackageResponse>>();

        var result = packages.Should().ContainSingle().Subject;

        result.Id.Should().Be(package.Id);
        result.Name.Should().Be(package.Name);
    }

    [Fact]
    public async Task GetPackageById_ShouldReturnPackage_WhenItExists()
    {
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedGamePackageAsync(game.Id);

        var response = await Client.GetAsync($"/api/packages/{package.Id}");

        var result = await response.ShouldBeSuccess<GamePackageResponse>();

        result.Id.Should().Be(package.Id);
        result.Name.Should().Be(package.Name);
    }

    [Fact]
    public async Task GetPackageById_ShouldReturnNotFound_WhenPackageDoesNotExist()
    {
        var response = await Client.GetAsync("/api/packages/999999");

        await response.ShouldHaveError(HttpStatusCode.NotFound, ErrorCode.GamePackageNotFound);
    }

    [Fact]
    public async Task GetPackageById_ShouldReturnBadRequest_WhenPackageIsInactive()
    {
        var game = await Factory.SeedGameAsync();

        var package = await Factory.SeedGamePackageAsync(game.Id, p =>
        {
            p.IsActive = false;
        });

        var response = await Client.GetAsync($"/api/packages/{package.Id}");

        await response.ShouldHaveError(HttpStatusCode.BadRequest, ErrorCode.GamePackageInactive);
    }
}
