using FluentAssertions;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.DTOs.Images;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Services.Games;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;
using GameTopUp.DAL.Queries;
using Microsoft.Data.Sqlite;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services;

public class GameServiceTests : IDisposable
{
    private readonly Mock<IGameRepository> _repository = new();
    private readonly Mock<IImageStorageService> _imageStorageService = new();
    private readonly DatabaseContext _database;
    private readonly GameService _service;

    public GameServiceTests()
    {
        _database = CreateDatabaseContext();
        _service = new GameService(_repository.Object, _imageStorageService.Object, new GameQuery(_database));
    }

    [Fact]
    public async Task CreateGameAsync_ShouldPersistGame()
    {
        Game? created = null;
        _repository.Setup(repo => repo.CreateAsync(It.IsAny<Game>()))
            .ReturnsAsync(15)
            .Callback<Game>(game => created = game);

        var game = await _service.CreateGameAsync(new CreateGameRequest
        {
            Name = "PUBG",
            IsActive = true
        });

        game.Id.Should().Be(15);
        created.Should().NotBeNull();
        created!.Name.Should().Be("PUBG");
        created.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task CreateGameAsync_ShouldUploadImageAndCleanupOnFailure()
    {
        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile>(), "games"))
            .ReturnsAsync(new ImageStorageResult
            {
                Url = "https://cdn.test/games/pubg.png",
                RelativePath = "/games/pubg.png"
            });
        _repository.Setup(repo => repo.CreateAsync(It.IsAny<Game>()))
            .ThrowsAsync(new InvalidOperationException("boom"));

        var image = new FormFile(new MemoryStream(new byte[] { 1 }), 0, 1, "image", "pubg.png");
        var act = async () => await _service.CreateGameAsync(new CreateGameRequest
        {
            Name = "PUBG",
            IsActive = true,
            ImageFile = image
        });

        await act.Should().ThrowAsync<InvalidOperationException>();
        _imageStorageService.Verify(service => service.DeleteAsync("/games/pubg.png"), Times.Once);
    }

    [Fact]
    public async Task UpdateGameAsync_ShouldTrimNameAndPersistChanges()
    {
        Game? updated = null;
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
            .ReturnsAsync(true)
            .Callback<Game>(game => updated = game);

        var game = await _service.UpdateGameAsync(7, new UpdateGameRequest
        {
            Name = "  New Game  ",
            IsActive = false,
            ImageUrl = "new-url",
            ImageRelativePath = "new-path"
        });

        game.Name.Should().Be("New Game");
        game.IsActive.Should().BeFalse();
        game.ImageUrl.Should().Be("new-url");
        game.ImageRelativePath.Should().Be("new-path");
        updated.Should().NotBeNull();
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
        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile>(), "games"))
            .ReturnsAsync(new ImageStorageResult
            {
                Url = "new-url",
                RelativePath = "/games/new.png"
            });
        _repository.Setup(repo => repo.UpdateAsync(It.IsAny<Game>()))
            .ReturnsAsync(true);

        var image = new FormFile(Stream.Null, 0, 1, "image", "new.png");
        var game = await _service.UpdateGameAsync(7, new UpdateGameRequest
        {
            ImageFile = image
        });

        game.ImageUrl.Should().Be("new-url");
        game.ImageRelativePath.Should().Be("/games/new.png");
        _imageStorageService.Verify(service => service.DeleteAsync("/games/old.png"), Times.Once);
    }

    [Fact]
    public async Task DeleteGameAsync_ShouldThrow_WhenGameDoesNotExist()
    {
        _repository.Setup(repo => repo.GetByIdAsync(7)).ReturnsAsync((Game?)null);

        var act = async () => await _service.DeleteGameAsync(7);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.GameNotFound);
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

        _repository.Verify(repo => repo.DeleteAsync(7), Times.Once);
        _imageStorageService.Verify(service => service.DeleteAsync("/games/old.png"), Times.Once);
    }

    private static DatabaseContext CreateDatabaseContext()
    {
        var connection = new SqliteConnection("Data Source=:memory:");
        connection.Open();
        return new DatabaseContext(connection);
    }

    public void Dispose()
    {
        _database.Dispose();
    }
}
