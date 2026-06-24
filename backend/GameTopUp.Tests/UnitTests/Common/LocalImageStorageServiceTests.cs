using FluentAssertions;
using GameTopUp.BLL.Common;
using GameTopUp.BLL.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Moq;

namespace GameTopUp.Tests.UnitTests.Common;

public sealed class LocalImageStorageServiceTests : IDisposable
{
    private readonly string _tempRoot;
    private readonly LocalImageStorageService _service;

    public LocalImageStorageServiceTests()
    {
        _tempRoot = Path.Combine(Path.GetTempPath(), "gametopup-local-image-tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(Path.Combine(_tempRoot, "wwwroot"));

        var environment = new Mock<IHostEnvironment>();
        environment.SetupGet(env => env.ContentRootPath).Returns(_tempRoot);

        _service = new LocalImageStorageService(environment.Object);
    }

    [Fact]
    public async Task UploadAsync_ValidImage_SavesFileAndReturnsUsableResult()
    {
        var image = CreateImage("cover.png", "image/png");

        var result = await _service.UploadAsync(image, "games");
        result.Should().NotBeNull();

        result!.Url.Should().Be("/" + result.RelativePath);
        result.RelativePath.Should().StartWith("uploads/games/");
        result.Bytes.Should().Be(image.Length);

        var physicalPath = GetPhysicalPath(result.RelativePath);
        File.Exists(physicalPath).Should().BeTrue();
    }

    [Fact]
    public async Task DeleteAsync_UploadedImage_RemovesFile()
    {
        var image = CreateImage("cover.png", "image/png");
        var result = await _service.UploadAsync(image, "games");
        result.Should().NotBeNull();
        var physicalPath = GetPhysicalPath(result!.RelativePath);

        File.Exists(physicalPath).Should().BeTrue();

        await _service.DeleteAsync(result.RelativePath);

        File.Exists(physicalPath).Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_PathTraversal_ThrowsInvalidImageFileName()
    {
        var act = async () => await _service.DeleteAsync("../../appsettings.json");

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidImageFile);
    }

    [Fact]
    public async Task UploadAsync_PathTraversalFolder_ThrowsInvalidImageFileName()
    {
        var image = CreateImage("cover.png", "image/png");

        var act = async () => await _service.UploadAsync(image, "../games");

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidImageFile);
    }

    [Fact]
    public async Task UploadAsync_UnsupportedImageType_ThrowsUnsupportedImageType()
    {
        var image = CreateImage("cover.txt", "text/plain");

        var act = async () => await _service.UploadAsync(image, "games");

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidImageFile);
    }

    [Fact]
    public async Task UploadAsync_ImageTooLarge_ThrowsImageTooLarge()
    {
        var image = CreateImage("cover.png", "image/png", length: 5 * 1024 * 1024 + 1);

        var act = async () => await _service.UploadAsync(image, "games");

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidImageFile);
    }

    private static IFormFile CreateImage(string fileName, string contentType)
        => CreateImage(fileName, contentType, length: 3);

    private static IFormFile CreateImage(string fileName, string contentType, long length)
    {
        var bytes = new byte[Math.Min(length, 16)];
        var stream = new MemoryStream(bytes);
        return new FormFile(stream, 0, length, "image", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
    }

    private string GetPhysicalPath(string relativePath)
    {
        var normalized = relativePath.TrimStart('/', '\\').Replace('/', Path.DirectorySeparatorChar);
        return Path.GetFullPath(Path.Combine(_tempRoot, "wwwroot", normalized));
    }

    public void Dispose()
    {
        try
        {
            if (Directory.Exists(_tempRoot))
            {
                Directory.Delete(_tempRoot, recursive: true);
            }
        }
        catch
        {
            // Best-effort cleanup for temp test artifacts.
        }
    }
}
