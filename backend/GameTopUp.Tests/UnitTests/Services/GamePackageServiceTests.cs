using FluentAssertions;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.DTOs.Images;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Services.Games;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services;

public class GamePackageServiceTests
{
    private readonly Mock<IGamePackageRepository> _packageRepository = new();
    private readonly Mock<IGameRepository> _gameRepository = new();
    private readonly Mock<IImageStorageService> _imageStorageService = new();
    private readonly GamePackageService _service;

    public GamePackageServiceTests()
    {
        _service = new GamePackageService(_packageRepository.Object, _gameRepository.Object, _imageStorageService.Object);
    }

    [Fact]
    public async Task CreatePackageAsync_ShouldThrow_WhenGameIsInactive()
    {
        _gameRepository
            .Setup(repo => repo.GetByIdAsync(10))
            .ReturnsAsync(new Game
            {
                Id = 10,
                IsActive = false
            });

        var request = new CreateGamePackageRequest
        {
            Name = "VIP",
            GameId = 10,
            SalePrice = 1000,
            OriginalPrice = 800,
            ImportPrice = 500,
            StockQuantity = 5
        };

        var act = async () => await _service.CreatePackageAsync(request);

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InactiveGameCannotAddPackage);
    }

    [Fact]
    public async Task CreatePackageAsync_ShouldThrow_WhenGameDoesNotExist()
    {
        _gameRepository
            .Setup(repo => repo.GetByIdAsync(10))
            .ReturnsAsync((Game?)null);

        var request = new CreateGamePackageRequest
        {
            Name = "VIP",
            GameId = 10,
            SalePrice = 1000,
            OriginalPrice = 800,
            ImportPrice = 500,
            StockQuantity = 5
        };

        var act = async () => await _service.CreatePackageAsync(request);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.GameNotFound);
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
            .ReturnsAsync(new GamePackage
            {
                Id = 5,
                IsActive = false
            });

        var act = async () => await _service.GetActivePackageByIdOrThrowAsync(5);

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.GamePackageInactive);
    }

    [Fact]
    public async Task GetActivePackageByIdOrThrowAsync_ShouldReturnPackage_WhenPackageIsActive()
    {
        _packageRepository
            .Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new GamePackage
            {
                Id = 5,
                IsActive = true
            });

        var package = await _service.GetActivePackageByIdOrThrowAsync(5);

        package.Id.Should().Be(5);
        package.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task RestorePackageAsync_ShouldThrow_WhenPackageDoesNotExist()
    {
        _packageRepository
            .Setup(repo => repo.IncreaseStockAsync(5, 1))
            .ReturnsAsync(0);

        var act = async () => await _service.RestorePackageAsync(5);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.GamePackageNotFound);
    }

    [Fact]
    public async Task ReservePackageAsync_ShouldDecreaseStock_WhenPackageIsAvailable()
    {
        _packageRepository
            .Setup(repo => repo.DecreaseStockAsync(5, 1))
            .ReturnsAsync(1);

        var act = async () => await _service.ReservePackageAsync(5);

        await act.Should().NotThrowAsync();
        _packageRepository.Verify(repo => repo.DecreaseStockAsync(5, 1), Times.Once);
    }

    [Fact]
    public async Task RestorePackageAsync_ShouldIncreaseStock_WhenPackageExists()
    {
        _packageRepository
            .Setup(repo => repo.IncreaseStockAsync(5, 1))
            .ReturnsAsync(1);

        var act = async () => await _service.RestorePackageAsync(5);

        await act.Should().NotThrowAsync();
        _packageRepository.Verify(repo => repo.IncreaseStockAsync(5, 1), Times.Once);
    }

    [Fact]
    public async Task CreatePackageAsync_ShouldTrimNameAndPersistPackage()
    {
        GamePackage? created = null;
        _gameRepository
            .Setup(repo => repo.GetByIdAsync(10))
            .ReturnsAsync(new Game
            {
                Id = 10,
                IsActive = true
            });
        _packageRepository
            .Setup(repo => repo.CreateAsync(It.IsAny<GamePackage>()))
            .ReturnsAsync(77)
            .Callback<GamePackage>(package => created = package);

        var package = await _service.CreatePackageAsync(new CreateGamePackageRequest
        {
            Name = "  VIP Pack  ",
            GameId = 10,
            SalePrice = 1000,
            OriginalPrice = 800,
            ImportPrice = 500,
            StockQuantity = 5,
            IsActive = false,
            ImageUrl = "https://image.test/package.png",
            ImageRelativePath = "/uploads/package.png"
        });

        package.Id.Should().Be(77);
        created.Should().NotBeNull();
        created!.Name.Should().Be("VIP Pack");
        created.GameId.Should().Be(10);
        created.SalePrice.Should().Be(1000);
        created.OriginalPrice.Should().Be(800);
        created.ImportPrice.Should().Be(500);
        created.StockQuantity.Should().Be(5);
        created.IsActive.Should().BeFalse();
        created.ImageUrl.Should().Be("https://image.test/package.png");
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
        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile>(), "game-packages"))
            .ReturnsAsync(new ImageStorageResult
            {
                Url = "https://cdn.test/packages/vip.png",
                RelativePath = "/packages/vip.png"
            });
        _packageRepository.Setup(repo => repo.CreateAsync(It.IsAny<GamePackage>()))
            .ThrowsAsync(new InvalidOperationException("boom"));

        var image = new FormFile(new MemoryStream(new byte[] { 1 }), 0, 1, "image", "vip.png");
        var act = async () => await _service.CreatePackageAsync(new CreateGamePackageRequest
        {
            Name = "VIP",
            GameId = 10,
            SalePrice = 1000,
            OriginalPrice = 800,
            ImportPrice = 500,
            StockQuantity = 5,
            ImageFile = image
        });

        await act.Should().ThrowAsync<InvalidOperationException>();
        _imageStorageService.Verify(service => service.DeleteAsync("/packages/vip.png"), Times.Once);
    }

    [Fact]
    public async Task UpdatePackageAsync_ShouldThrow_WhenPackageDoesNotExist()
    {
        _packageRepository
            .Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync((GamePackage?)null);

        var act = async () => await _service.UpdatePackageAsync(5, new UpdateGamePackageRequest
        {
            Name = "Updated"
        });

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.GamePackageNotFound);
    }

    [Fact]
    public async Task UpdatePackageAsync_ShouldUpdateOnlyProvidedFields()
    {
        GamePackage? updated = null;
        _packageRepository
            .Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new GamePackage
            {
                Id = 5,
                Name = "Old Name",
                ImageUrl = "old-url",
                ImageRelativePath = "old-path",
                GameId = 10,
                SalePrice = 100m,
                OriginalPrice = 90m,
                ImportPrice = 80m,
                StockQuantity = 2,
                IsActive = true
            });
        _packageRepository
            .Setup(repo => repo.UpdateAsync(It.IsAny<GamePackage>()))
            .ReturnsAsync(true)
            .Callback<GamePackage>(package => updated = package);

        var package = await _service.UpdatePackageAsync(5, new UpdateGamePackageRequest
        {
            Name = "  New Name  ",
            SalePrice = 150m,
            StockQuantity = 4,
            IsActive = false
        });

        package.Name.Should().Be("New Name");
        package.SalePrice.Should().Be(150m);
        package.StockQuantity.Should().Be(4);
        package.IsActive.Should().BeFalse();
        package.ImageUrl.Should().Be("old-url");
        package.ImageRelativePath.Should().Be("old-path");
        package.OriginalPrice.Should().Be(90m);
        package.ImportPrice.Should().Be(80m);
        updated.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdatePackageAsync_ShouldUploadImageAndDeleteOldFile()
    {
        _packageRepository
            .Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new GamePackage
            {
                Id = 5,
                Name = "Old Name",
                ImageUrl = "old-url",
                ImageRelativePath = "/packages/old.png",
                GameId = 10,
                SalePrice = 100m,
                OriginalPrice = 90m,
                ImportPrice = 80m,
                StockQuantity = 2,
                IsActive = true
            });
        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile>(), "game-packages"))
            .ReturnsAsync(new ImageStorageResult
            {
                Url = "new-url",
                RelativePath = "/packages/new.png"
            });
        _packageRepository
            .Setup(repo => repo.UpdateAsync(It.IsAny<GamePackage>()))
            .ReturnsAsync(true);

        var image = new FormFile(new MemoryStream(new byte[] { 9 }), 0, 1, "image", "new.png");
        var package = await _service.UpdatePackageAsync(5, new UpdateGamePackageRequest
        {
            ImageFile = image
        });

        package.ImageUrl.Should().Be("new-url");
        package.ImageRelativePath.Should().Be("/packages/new.png");
        _imageStorageService.Verify(service => service.DeleteAsync("/packages/old.png"), Times.Once);
    }

    [Fact]
    public async Task DeletePackageAsync_ShouldThrow_WhenPackageDoesNotExist()
    {
        _packageRepository
            .Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync((GamePackage?)null);

        var act = async () => await _service.DeletePackageAsync(5);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.GamePackageNotFound);
    }

    [Fact]
    public async Task DeletePackageAsync_ShouldDeleteImageAndPackage()
    {
        _packageRepository
            .Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new GamePackage
            {
                Id = 5,
                IsActive = true,
                ImageRelativePath = "/packages/old.png"
            });
        _packageRepository
            .Setup(repo => repo.DeleteAsync(5))
            .ReturnsAsync(1);

        await _service.DeletePackageAsync(5);

        _packageRepository.Verify(repo => repo.DeleteAsync(5), Times.Once);
        _imageStorageService.Verify(service => service.DeleteAsync("/packages/old.png"), Times.Once);
    }

    [Fact]
    public async Task UpdatePackageAsync_ShouldThrow_WhenStockQuantityIsNegative()
    {
        _packageRepository
            .Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new GamePackage
            {
                Id = 5,
                StockQuantity = 2,
                IsActive = true
            });

        var act = async () => await _service.UpdatePackageAsync(5, new UpdateGamePackageRequest
        {
            StockQuantity = -1
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.StockQuantityMustBePositive);
    }

}
