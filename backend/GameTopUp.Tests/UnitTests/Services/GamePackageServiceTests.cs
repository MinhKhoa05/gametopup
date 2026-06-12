using FluentAssertions;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Games;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services;

public class GamePackageServiceTests
{
    private readonly Mock<IGamePackageRepository> _packageRepository = new();
    private readonly Mock<IGameRepository> _gameRepository = new();
    private readonly GamePackageService _service;

    public GamePackageServiceTests()
    {
        _service = new GamePackageService(_packageRepository.Object, _gameRepository.Object);
    }

    [Fact]
    public async Task CreatePackageAsync_ShouldThrow_WhenGameIsInactive()
    {
        _gameRepository
            .Setup(repo => repo.GetByIdAsync(10))
            .ReturnsAsync(new Game { Id = 10, IsActive = false });

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
    public async Task UpdatePackageAsync_ShouldThrow_WhenStockQuantityIsNegative()
    {
        _packageRepository
            .Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new GamePackage { Id = 5, IsActive = true, StockQuantity = 2 });

        var act = async () => await _service.UpdatePackageAsync(5, new UpdateGamePackageRequest
        {
            StockQuantity = -1
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.StockQuantityMustBePositive);
    }

}
