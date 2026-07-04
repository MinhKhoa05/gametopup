using FluentAssertions;
using GameTopUp.BLL.Services.Images;

namespace GameTopUp.UnitTests.Services;

public sealed class PublicImageUrlBuilderTests
{
    [Fact]
    public void Build_ShouldCombineBaseUrlAndRelativeUploadPath()
    {
        var builder = CreateBuilder("https://cdn.example.com");

        var result = builder.Build("/uploads/games/2026/06/example.png");

        result.Should().Be("https://cdn.example.com/uploads/games/2026/06/example.png");
    }

    [Fact]
    public void Build_ShouldTrimTrailingSlashFromConfiguredBaseUrl()
    {
        var builder = CreateBuilder("https://api.example.com/");

        var result = builder.Build("/uploads/games/2026/06/example.png");

        result.Should().Be("https://api.example.com/uploads/games/2026/06/example.png");
    }

    [Fact]
    public void Build_ShouldReturnAbsoluteUrlUnchanged()
    {
        var builder = CreateBuilder("https://api.example.com");

        var result = builder.Build("https://images.example.com/example.png");

        result.Should().Be("https://images.example.com/example.png");
    }

    [Fact]
    public void Build_ShouldReturnEmptyString_WhenImagePathIsMissing()
    {
        var builder = CreateBuilder("https://api.example.com");

        var result = builder.Build(null);

        result.Should().BeEmpty();
    }

    private static PublicImageUrlBuilder CreateBuilder(string baseUrl)
    {
        return new PublicImageUrlBuilder(baseUrl);
    }
}
