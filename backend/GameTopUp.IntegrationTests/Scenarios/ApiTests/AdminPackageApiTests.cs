using System.Net;
using System.Net.Http.Headers;
using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.IntegrationTests.Extensions;
using GameTopUp.IntegrationTests.Infrastructure;

namespace GameTopUp.IntegrationTests.Scenarios.ApiTests;

[Collection("Integration")]
public sealed class AdminPackageApiTests : BaseIntegrationTest
{
    public AdminPackageApiTests(CustomWebApplicationFactory factory)
    : base(factory)
    {
    }

    [Fact]
    public async Task GetByGameId_ShouldReturnPackages()
    {
        var game = await Factory.SeedGameAsync();

        var package = await Factory.SeedPackageAsync(game.Id, p =>
        {
            p.Name = "UC 60";
            p.AvailableSlots = 7;
        });

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.GetAsync($"/api/admin/games/{game.Id}/packages");

        var packages = await response.ShouldBeSuccess<List<AdminPackageResponse>>();

        var result = packages.Should().ContainSingle().Subject;

        result.Id.Should().Be(package.Id);
        result.Name.Should().Be(package.Name);
    }

    [Fact]
    public async Task CreatePackage_ShouldCreatePackage()
    {
        var game = await Factory.SeedGameAsync();

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostMultipartAsync(
            $"/api/admin/games/{game.Id}/packages",
            new Dictionary<string, string>
            {
                ["Name"] = "  Diamond 86  ",
                ["SalePrice"] = "100000",
                ["OriginalPrice"] = "120000",
                ["ImportPrice"] = "80000",
                ["AvailableSlots"] = "3",
                ["IsActive"] = "true"
            },
            CreateImageContent(),
            fileName: "diamond-86.png");

        var created = await response.ShouldBeSuccess<AdminPackageResponse>(HttpStatusCode.Created);

        created.Name.Should().Be("Diamond 86");

        var package = await Factory.GetPackageAsync(created.Id);

        package.Should().NotBeNull();
        package!.Name.Should().Be("Diamond 86");
    }

    [Fact]
    public async Task UpdatePackage_ShouldPersistChanges()
    {
        var game = await Factory.SeedGameAsync();

        var package = await Factory.SeedPackageAsync(game.Id, p =>
        {
            p.Name = "Old Package";
            p.SalePrice = 100_000m;
            p.AvailableSlots = 3;
            p.IsActive = true;
        });

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PutMultipartAsync(
            $"/api/admin/packages/{package.Id}",
            new Dictionary<string, string>
            {
                ["Name"] = "  Diamond 128  ",
                ["SalePrice"] = "180000",
                ["AvailableSlots"] = "5",
                ["IsActive"] = "false"
            },
            CreateImageContent(),
            fileName: "diamond-128.png");

        await response.ShouldBeSuccess<AdminPackageResponse>();

        var updated = await Factory.GetPackageAsync(package.Id);

        updated.Should().NotBeNull();
        updated!.Name.Should().Be("Diamond 128");
        updated.SalePrice.Should().Be(180_000m);
        updated.AvailableSlots.Should().Be(5);
        updated.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task DeletePackage_ShouldRemovePackage()
    {
        var game = await Factory.SeedGameAsync();

        var package = await Factory.SeedPackageAsync(game.Id);

        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.DeleteAsync($"/api/admin/packages/{package.Id}");

        await response.ShouldBeSuccess();

        var deletedPackage = await Factory.GetPackageAsync(package.Id);

        deletedPackage.Should().BeNull();
    }

    [Fact]
    public async Task CreatePackage_ShouldReturnNotFound_WhenGameDoesNotExist()
    {
        var admin = await Factory.SeedAdminAsync();

        using var client = CreateHeaderAuthenticatedClient(admin);

        var response = await client.PostMultipartAsync(
            "/api/admin/games/999999/packages",
            new Dictionary<string, string>
            {
                ["Name"] = "VIP",
                ["SalePrice"] = "100000",
                ["OriginalPrice"] = "120000",
                ["ImportPrice"] = "80000",
                ["AvailableSlots"] = "3"
            },
            CreateImageContent(),
            fileName: "vip.png");

        await response.ShouldHaveError(HttpStatusCode.NotFound, ErrorCode.GameNotFound);
    }

    [Fact]
    public async Task ProtectedEndpoints_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var response = await Client.GetAsync("/api/admin/games/1/packages");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ProtectedEndpoints_ShouldReturnForbidden_WhenMember()
    {
        var member = await Factory.SeedUserAsync();

        using var client = CreateHeaderAuthenticatedClient(member);

        var response = await client.GetAsync("/api/admin/games/1/packages");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    private static HttpContent CreateImageContent()
    {
        var content = new ByteArrayContent(new byte[] { 1, 2, 3 });

        content.Headers.ContentType = new MediaTypeHeaderValue("image/png");

        return content;
    }
}
