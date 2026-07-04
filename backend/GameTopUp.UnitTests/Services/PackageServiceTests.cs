using FluentAssertions;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Images;
using GameTopUp.BLL.Services.Games;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using GameTopUp.UnitTests.Utilities;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GameTopUp.UnitTests.Services;

public class PackageServiceTests
{
    private readonly Mock<IPackageRepository> _packageRepository = new();
    private readonly Mock<IGameRepository> _gameRepository = new();
    private readonly Mock<IImageStorageService> _imageStorageService = new();
    private readonly PackageService _service;

    public PackageServiceTests()
    {
        _service = new PackageService(
            _packageRepository.Object,
            _gameRepository.Object,
            _imageStorageService.Object,
            new PublicImageUrlBuilder("https://api.test"));
    }

    [Fact]
    public async Task CreatePackageAsync_ShouldThrow_WhenGameDoesNotExist()
    {
        _gameRepository
            .Setup(repo => repo.GetByIdAsync(10))
            .ReturnsAsync((Game?)null);

        var request = new CreatePackageRequest
        {
            Name = "VIP",
            SalePrice = 1000,
            OriginalPrice = 800,
            ImportPrice = 500,
            AvailableSlots = 5,
            ImageFile = TestFormFiles.Image("vip.png")
        };

        var act = async () => await _service.CreatePackageAsync(10, request);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.GameNotFound);
        _imageStorageService.Verify(service => service.UploadAsync(It.IsAny<IFormFile?>(), "packages"), Times.Never);
        _packageRepository.Verify(repo => repo.CreateAsync(It.IsAny<Package>()), Times.Never);
    }

    [Fact]
    public async Task ReservePackageAsync_ShouldThrow_WhenStockIsInsufficient()
    {
        _packageRepository
            .Setup(repo => repo.DecreaseStockAsync(5, 1))
            .ReturnsAsync(0);

        var act = async () => await _service.ReservePackageAsync(5);

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.PackageOutOfStock);
    }

    [Fact]
    public async Task GetActivePackageByIdOrThrowAsync_ShouldThrow_WhenPackageIsInactive()
    {
        _packageRepository
            .Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new Package
            {
                Id = 5,
                IsActive = false
            });

        var act = async () => await _service.GetActivePackageByIdOrThrowAsync(5);

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.PackageInactive);
    }

    [Fact]
    public async Task RestorePackageAsync_ShouldThrow_WhenPackageDoesNotExist()
    {
        _packageRepository
            .Setup(repo => repo.IncreaseStockAsync(5, 1))
            .ReturnsAsync(0);

        var act = async () => await _service.RestorePackageAsync(5);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.PackageNotFound);
    }

    [Fact]
    public async Task CreatePackageAsync_ShouldTrimNameAndPersistPackage()
    {
        Package? created = null;
        _gameRepository
            .Setup(repo => repo.GetByIdAsync(10))
            .ReturnsAsync(new Game
            {
                Id = 10,
                IsActive = true
            });
        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile?>(), "packages"))
            .ReturnsAsync(new ImageStorageResult
            {
                Url = "https://image.test/package.png",
                RelativePath = "/uploads/package.png"
            });
        _packageRepository
            .Setup(repo => repo.CreateAsync(It.IsAny<Package>()))
            .ReturnsAsync(77)
            .Callback<Package>(package => created = package);

        var package = await _service.CreatePackageAsync(10, new CreatePackageRequest
        {
            Name = "  VIP Pack  ",
            SalePrice = 1000,
            OriginalPrice = 800,
            ImportPrice = 500,
            AvailableSlots = 5,
            IsActive = false,
            ImageFile = TestFormFiles.Image("package.png")
        });

        package.Id.Should().Be(77);
        created.Should().NotBeNull();
        created!.Name.Should().Be("VIP Pack");
        created.GameId.Should().Be(10);
        created.ImageRelativePath.Should().Be("/uploads/package.png");
    }

    [Fact]
    public async Task CreatePackageAsync_ShouldUploadImageAndCleanupOnFailure()
    {
        _gameRepository
            .Setup(repo => repo.GetByIdAsync(10))
            .ReturnsAsync(new Game
            {
                Id = 10,
                IsActive = true
            });
        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile?>(), "packages"))
            .ReturnsAsync(new ImageStorageResult
            {
                Url = "https://cdn.test/packages/vip.png",
                RelativePath = "/packages/vip.png"
            });
        _packageRepository.Setup(repo => repo.CreateAsync(It.IsAny<Package>()))
            .ThrowsAsync(new InvalidOperationException("boom"));

        var act = async () => await _service.CreatePackageAsync(10, new CreatePackageRequest
        {
            Name = "VIP",
            SalePrice = 1000,
            OriginalPrice = 800,
            ImportPrice = 500,
            AvailableSlots = 5,
            ImageFile = TestFormFiles.Image("vip.png")
        });

        await act.Should().ThrowAsync<InvalidOperationException>();
        _imageStorageService.Verify(service => service.DeleteAsync("/packages/vip.png"), Times.Once);
    }

    [Fact]
    public async Task UpdatePackageAsync_ShouldUpdateOnlyProvidedFields()
    {
        _packageRepository
            .Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new Package
            {
                Id = 5,
                Name = "Old Name",
                ImageUrl = "old-url",
                ImageRelativePath = "old-path",
                GameId = 10,
                SalePrice = 100m,
                OriginalPrice = 90m,
                ImportPrice = 80m,
                AvailableSlots = 2,
                IsActive = true
            });
        _packageRepository
            .Setup(repo => repo.UpdateAsync(It.IsAny<Package>()))
            .ReturnsAsync(true);

        var package = await _service.UpdatePackageAsync(5, new UpdatePackageRequest
        {
            Name = "  New Name  ",
            SalePrice = 150m,
            AvailableSlots = 4,
            IsActive = false
        });

        package.Name.Should().Be("New Name");
        package.SalePrice.Should().Be(150m);
        package.AvailableSlots.Should().Be(4);
        package.ImageUrl.Should().Be("old-url");
    }

    [Fact]
    public async Task UpdatePackageAsync_ShouldUploadImageAndDeleteOldFile()
    {
        _packageRepository
            .Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new Package
            {
                Id = 5,
                Name = "Old Name",
                ImageUrl = "old-url",
                ImageRelativePath = "/packages/old.png",
                GameId = 10,
                SalePrice = 100m,
                OriginalPrice = 90m,
                ImportPrice = 80m,
                AvailableSlots = 2,
                IsActive = true
            });
        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile?>(), "packages"))
            .ReturnsAsync(new ImageStorageResult
            {
                Url = "new-url",
                RelativePath = "/packages/new.png"
            });
        _packageRepository
            .Setup(repo => repo.UpdateAsync(It.IsAny<Package>()))
            .ReturnsAsync(true);

        var package = await _service.UpdatePackageAsync(5, new UpdatePackageRequest
        {
            ImageFile = TestFormFiles.Image("new.png")
        });

        package.ImageUrl.Should().Be("new-url");
        package.ImageRelativePath.Should().Be("/packages/new.png");
        _imageStorageService.Verify(service => service.DeleteAsync("/packages/old.png"), Times.Once);
    }

    [Fact]
    public async Task DeletePackageAsync_ShouldDeleteImageAndPackage()
    {
        _packageRepository
            .Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new Package
            {
                Id = 5,
                IsActive = true,
                ImageRelativePath = "/packages/old.png"
            });
        _packageRepository
            .Setup(repo => repo.DeleteAsync(5))
            .ReturnsAsync(1);

        await _service.DeletePackageAsync(5);

        _imageStorageService.Verify(service => service.DeleteAsync("/packages/old.png"), Times.Once);
        _packageRepository.Verify(repo => repo.DeleteAsync(5), Times.Once);
    }

    [Fact]
    public async Task UpdatePackageAsync_ShouldCleanupNewImage_WhenUpdateFails()
    {
        _packageRepository
            .Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new Package
            {
                Id = 5,
                Name = "Old Name",
                ImageUrl = "old-url",
                ImageRelativePath = "/packages/old.png",
                GameId = 10,
                SalePrice = 100m,
                OriginalPrice = 90m,
                ImportPrice = 80m,
                AvailableSlots = 2,
                IsActive = true
            });

        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile?>(), "packages"))
            .ReturnsAsync(new ImageStorageResult
            {
                Url = "new-url",
                RelativePath = "/packages/new.png"
            });

        _packageRepository
            .Setup(repo => repo.UpdateAsync(It.IsAny<Package>()))
            .ThrowsAsync(new InvalidOperationException("boom"));

        var act = async () => await _service.UpdatePackageAsync(5, new UpdatePackageRequest
        {
            ImageFile = TestFormFiles.Image("new.png")
        });

        await act.Should().ThrowAsync<InvalidOperationException>();
        _imageStorageService.Verify(service => service.DeleteAsync("/packages/old.png"), Times.Never);
        _imageStorageService.Verify(service => service.DeleteAsync("/packages/new.png"), Times.Once);
    }
}
