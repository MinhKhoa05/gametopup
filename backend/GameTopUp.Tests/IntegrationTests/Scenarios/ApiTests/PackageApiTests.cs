using System.Net;
using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.Tests.IntegrationTests.Extensions;
using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class PackageApiTests : BaseIntegrationTest
{
    public PackageApiTests(CustomWebApplicationFactory factory)
    : base(factory)
    {
    }

    [Fact]
    public async Task GetPackagesByGame_ShouldReturnPackagesForRequestedGame()
    {
        var game = await Factory.SeedGameAsync();
        var otherGame = await Factory.SeedGameAsync();

        var package = await Factory.SeedPackageAsync(game.Id);

        await Factory.SeedPackageAsync(otherGame.Id);

        var response = await Client.GetAsync($"/api/games/{game.Id}/packages");

        var packages = await response.ShouldBeSuccess<List<PackageResponse>>();

        var result = packages.Should().ContainSingle().Subject;

        result.Id.Should().Be(package.Id);
        result.Name.Should().Be(package.Name);
    }

    [Fact]
    public async Task GetPackageById_ShouldReturnPackage_WhenItExists()
    {
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedPackageAsync(game.Id);

        var response = await Client.GetAsync($"/api/packages/{package.Id}");

        var result = await response.ShouldBeSuccess<PackageResponse>();

        result.Id.Should().Be(package.Id);
        result.Name.Should().Be(package.Name);
    }

    [Fact]
    public async Task GetPackageById_ShouldReturnNotFound_WhenPackageDoesNotExist()
    {
        var response = await Client.GetAsync("/api/packages/999999");

        await response.ShouldHaveError(HttpStatusCode.NotFound, ErrorCode.PackageNotFound);
    }

    [Fact]
    public async Task GetPackageById_ShouldReturnBadRequest_WhenPackageIsInactive()
    {
        var game = await Factory.SeedGameAsync();

        var package = await Factory.SeedPackageAsync(game.Id, p =>
        {
            p.IsActive = false;
        });

        var response = await Client.GetAsync($"/api/packages/{package.Id}");

        await response.ShouldHaveError(HttpStatusCode.BadRequest, ErrorCode.PackageInactive);
    }
}
