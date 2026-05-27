using FluentAssertions;
using GameTopUp.BLL.Config;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.DTOs.Images;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using Moq;
using Xunit;

namespace GameTopUp.Tests.UnitTests.Services
{
    public class GamePackageServiceTests
    {
        private readonly Mock<IGamePackageRepository> _packageRepoMock;
        private readonly Mock<IGameRepository> _gameRepoMock;
        private readonly Mock<ICloudinaryUploader> _cloudinaryUploaderMock;
        private readonly GamePackageService _packageService;

        public GamePackageServiceTests()
        {
            MapsterConfig.RegisterMappings();
            _packageRepoMock = new Mock<IGamePackageRepository>();
            _gameRepoMock = new Mock<IGameRepository>();
            _cloudinaryUploaderMock = new Mock<ICloudinaryUploader>();
            _packageService = new GamePackageService(
                _packageRepoMock.Object,
                _gameRepoMock.Object,
                _cloudinaryUploaderMock.Object);
        }

        [Fact]
        public async Task CreatePackageWithImageAsync_ShouldUploadImageAndPersistCloudinaryInfo()
        {
            var game = new Game { Id = 1, IsActive = true };
            var request = new CreateGamePackageRequest
            {
                Name = "100 Diamonds",
                GameId = 1,
                SalePrice = 10000,
                OriginalPrice = 12000,
                ImportPrice = 8000,
                StockQuantity = 10,
                IsActive = true
            };

            _gameRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(game);
            _cloudinaryUploaderMock
                .Setup(u => u.UploadImageAsync(It.IsAny<Stream>(), "product.webp", "image/webp"))
                .ReturnsAsync(new ImageUploadResult
                {
                    PublicId = "gametopup/product",
                    Url = "http://res.cloudinary.com/demo/image/upload/product.webp",
                    SecureUrl = "https://res.cloudinary.com/demo/image/upload/product.webp"
                });

            GamePackage? createdPackage = null;
            _packageRepoMock.Setup(r => r.CreateAsync(It.IsAny<GamePackage>()))
                .Callback<GamePackage>(package => createdPackage = package)
                .ReturnsAsync(9);

            await using var image = new MemoryStream(new byte[] { 1, 2, 3 });
            var result = await _packageService.CreatePackageWithImageAsync(
                request,
                image,
                "product.webp",
                "image/webp",
                image.Length);

            result.Id.Should().Be(9);
            createdPackage.Should().NotBeNull();
            createdPackage!.ImageUrl.Should().Be("https://res.cloudinary.com/demo/image/upload/product.webp");
            createdPackage.ImagePublicId.Should().Be("gametopup/product");
        }

        [Fact]
        public async Task CreatePackageAsync_ShouldThrow_WhenGameIsInactive()
        {
            var game = new Game { Id = 1, IsActive = false };
            var request = new CreateGamePackageRequest { GameId = 1 };
            _gameRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(game);

            Func<Task> act = () => _packageService.CreatePackageAsync(request);

            await act.Should().ThrowAsync<BusinessException>()
                .WithMessage("Không thể thêm gói nạp vào Game đang ở trạng thái ngừng hoạt động.");
        }

        [Fact]
        public async Task GetPackageByIdOrThrowAsync_ShouldThrowNotFound_WhenDoesNotExist()
        {
            _packageRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((GamePackage?)null);

            Func<Task> act = () => _packageService.GetPackageByIdOrThrowAsync(99);

            await act.Should().ThrowAsync<NotFoundException>()
                .WithMessage("Gói nạp không tồn tại.");
        }

        [Fact]
        public async Task GetAvailablePackageAsync_ShouldThrow_WhenInactive()
        {
            var package = new GamePackage { Id = 1, IsActive = false };
            _packageRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(package);

            Func<Task> act = () => _packageService.GetAvailablePackageAsync(1, 5);

            await act.Should().ThrowAsync<BusinessException>()
                .WithMessage("Gói nạp hiện không khả dụng.");
        }

        [Fact]
        public async Task GetAvailablePackageAsync_ShouldThrow_WhenInsufficientStock()
        {
            var package = new GamePackage { Id = 1, IsActive = true, StockQuantity = 2 };
            _packageRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(package);

            Func<Task> act = () => _packageService.GetAvailablePackageAsync(1, 5);

            await act.Should().ThrowAsync<BusinessException>()
                .WithMessage("Số lượng trong kho không đủ.");
        }

        [Fact]
        public async Task GetAvailablePackageAsync_ShouldSucceed_WhenValid()
        {
            var package = new GamePackage { Id = 1, IsActive = true, StockQuantity = 10 };
            _packageRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(package);

            var result = await _packageService.GetAvailablePackageAsync(1, 5);

            result.Should().NotBeNull();
            result.Id.Should().Be(1);
            result.StockQuantity.Should().Be(10);
        }
    }
}
