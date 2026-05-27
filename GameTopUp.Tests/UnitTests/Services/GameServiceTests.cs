using Moq;
using GameTopUp.DAL.Interfaces.Games;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Entities;
using Xunit;
using FluentAssertions;
using GameTopUp.BLL.Config;

namespace GameTopUp.Tests.UnitTests.Services
{
    public class GameServiceTests
    {
        private readonly Mock<IGameRepository> _gameRepoMock;
        private readonly GameService _gameService;

        public GameServiceTests()
        {
            MapsterConfig.RegisterMappings();
            _gameRepoMock = new Mock<IGameRepository>();
            _gameService = new GameService(_gameRepoMock.Object);
        }

        [Fact]
        public async Task GetGameByIdAsync_ShouldThrowNotFound_WhenGameDoesNotExist()
        {
            // Arrange
            _gameRepoMock.Setup(r => r.GetByIdAsync(123L)).ReturnsAsync((Game?)null);

            // Act
            Func<Task> act = () => _gameService.GetGameByIdAsync(123L);

            // Assert
            await act.Should().ThrowAsync<NotFoundException>()
                .WithMessage("Game không tồn tại.");
        }
    }
}
