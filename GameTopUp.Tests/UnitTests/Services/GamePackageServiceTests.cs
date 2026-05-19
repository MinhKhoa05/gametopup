using Moq;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using Xunit;
using FluentAssertions;
using GameTopUp.BLL.Config;

namespace GameTopUp.Tests.UnitTests.Services
{
    public class GamePackageServiceTests
    {
        private readonly Mock<IGamePackageRepository> _packageRepoMock;
        private readonly Mock<IGameRepository> _gameRepoMock;
        private readonly GamePackageService _packageService;

        public GamePackageServiceTests()
        {
            MapsterConfig.RegisterMappings();
            _packageRepoMock = new Mock<IGamePackageRepository>();
            _gameRepoMock = new Mock<IGameRepository>();
            _packageService = new GamePackageService(_packageRepoMock.Object, _gameRepoMock.Object);
        }

        [Fact]
        public async Task CreatePackageAsync_ShouldThrow_WhenGameIsInactive()
        {
            // Arrange
            var game = new Game { Id = 1, IsActive = false };
            var request = new CreateGamePackageRequest { GameId = 1 };
            _gameRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(game);

            // Act
            Func<Task> act = () => _packageService.CreatePackageAsync(request);

            // Assert
            await act.Should().ThrowAsync<BusinessException>()
                .WithMessage("Không thể thêm gói nạp vào Game đang ở trạng thái ngừng hoạt động.");
        }

        [Fact]
        public async Task GetPackageByIdOrThrowAsync_ShouldThrowNotFound_WhenDoesNotExist()
        {
            // Arrange
            _packageRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((GamePackage?)null);

            // Act
            Func<Task> act = () => _packageService.GetPackageByIdOrThrowAsync(99);

            // Assert
            await act.Should().ThrowAsync<NotFoundException>()
                .WithMessage("Gói nạp không tồn tại.");
        }

        [Fact]
        public async Task GetAvailablePackageAsync_ShouldThrow_WhenInactive()
        {
            // Arrange
            var package = new GamePackage { Id = 1, IsActive = false };
            _packageRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(package);

            // Act
            Func<Task> act = () => _packageService.GetAvailablePackageAsync(1, 5);

            // Assert
            await act.Should().ThrowAsync<BusinessException>()
                .WithMessage("Gói nạp hiện không khả dụng.");
        }

        [Fact]
        public async Task GetAvailablePackageAsync_ShouldThrow_WhenInsufficientStock()
        {
            // Arrange
            var package = new GamePackage { Id = 1, IsActive = true, StockQuantity = 2 };
            _packageRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(package);

            // Act
            Func<Task> act = () => _packageService.GetAvailablePackageAsync(1, 5);

            // Assert
            await act.Should().ThrowAsync<BusinessException>()
                .WithMessage("Số lượng trong kho không đủ.");
        }

        [Fact]
        public async Task GetAvailablePackageAsync_ShouldSucceed_WhenValid()
        {
            // Arrange
            var package = new GamePackage { Id = 1, IsActive = true, StockQuantity = 10 };
            _packageRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(package);

            // Act
            var result = await _packageService.GetAvailablePackageAsync(1, 5);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(1);
            result.StockQuantity.Should().Be(10);
        }
    }
}
