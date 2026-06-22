using FluentAssertions;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.DTOs.Images;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Services.Games;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;
using GameTopUp.Tests.UnitTests.Support;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services;

public class GameServiceTests
{
    private readonly Mock<IGameRepository> _repository = new();
    private readonly Mock<IImageStorageService> _imageStorageService = new();
    private readonly GameService _service;

    public GameServiceTests()
    {
        _service = new GameService(_repository.Object, _imageStorageService.Object);
    }

    [Fact]
    public async Task CreateGameAsync_ShouldUploadImageAndCleanupOnFailure()
    {
        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile?>(), "games"))
            .ReturnsAsync(new ImageStorageResult
            {
                Url = "https://cdn.test/games/pubg.png",
                RelativePath = "/games/pubg.png"
            });
        _repository.Setup(repo => repo.CreateAsync(It.IsAny<Game>()))
            .ThrowsAsync(new InvalidOperationException("boom"));

        var act = async () => await _service.CreateGameAsync(new CreateGameRequest
        {
            Name = "PUBG",
            IsActive = true,
            ImageFile = TestFormFiles.Image("pubg.png")
        });

        await act.Should().ThrowAsync<InvalidOperationException>();
        _imageStorageService.Verify(service => service.DeleteAsync("/games/pubg.png"), Times.Once);
    }

    [Fact]
    public async Task UpdateGameAsync_ShouldTrimNameAndPersistChanges()
    {
        _repository.Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync(new Game
            {
                Id = 7,
                Name = "Old",
                ImageUrl = "old-url",
                ImageRelativePath = "old-path",
                IsActive = true
            });
        _repository.Setup(repo => repo.UpdateAsync(It.IsAny<Game>()))
            .ReturnsAsync(true);

        var game = await _service.UpdateGameAsync(7, new UpdateGameRequest
        {
            Name = "  New Game  ",
            IsActive = false
        });

        game.Name.Should().Be("New Game");
        game.IsActive.Should().BeFalse();
        game.ImageUrl.Should().Be("old-url");
        game.TotalPackages.Should().Be(0);
    }

    [Fact]
    public async Task UpdateGameAsync_ShouldUploadImageAndDeleteOldFile()
    {
        _repository.Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync(new Game
            {
                Id = 7,
                Name = "Old",
                ImageUrl = "old-url",
                ImageRelativePath = "/games/old.png",
                IsActive = true
            });
        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile?>(), "games"))
            .ReturnsAsync(new ImageStorageResult
            {
                Url = "new-url",
                RelativePath = "/games/new.png"
            });
        _repository.Setup(repo => repo.UpdateAsync(It.IsAny<Game>()))
            .ReturnsAsync(true);

        var game = await _service.UpdateGameAsync(7, new UpdateGameRequest
        {
            ImageFile = TestFormFiles.Image("new.png")
        });

        game.ImageUrl.Should().Be("new-url");
        game.TotalPackages.Should().Be(0);
        _imageStorageService.Verify(service => service.DeleteAsync("/games/old.png"), Times.Once);
    }

    [Fact]
    public async Task UpdateGameAsync_ShouldCleanupNewImage_WhenUpdateFails()
    {
        _repository.Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync(new Game
            {
                Id = 7,
                Name = "Old",
                ImageUrl = "old-url",
                ImageRelativePath = "/games/old.png",
                IsActive = true
            });

        _imageStorageService
            .Setup(service => service.UploadAsync(It.IsAny<IFormFile?>(), "games"))
            .ReturnsAsync(new ImageStorageResult
            {
                Url = "new-url",
                RelativePath = "/games/new.png"
            });

        _repository.Setup(repo => repo.UpdateAsync(It.IsAny<Game>()))
            .ThrowsAsync(new InvalidOperationException("boom"));

        var act = async () => await _service.UpdateGameAsync(7, new UpdateGameRequest
        {
            ImageFile = TestFormFiles.Image("new.png")
        });

        await act.Should().ThrowAsync<InvalidOperationException>();
        _imageStorageService.Verify(service => service.DeleteAsync("/games/new.png"), Times.Once);
        _imageStorageService.Verify(service => service.DeleteAsync("/games/old.png"), Times.Never);
    }

    [Fact]
    public async Task DeleteGameAsync_ShouldDeleteImageAndGame()
    {
        _repository.Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync(new Game
            {
                Id = 7,
                ImageRelativePath = "/games/old.png"
            });
        _repository.Setup(repo => repo.DeleteAsync(7))
            .ReturnsAsync(1);

        await _service.DeleteGameAsync(7);

        _imageStorageService.Verify(service => service.DeleteAsync("/games/old.png"), Times.Once);
    }
}
