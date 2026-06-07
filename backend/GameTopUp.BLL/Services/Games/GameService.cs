using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces.Games;
using Mapster;

namespace GameTopUp.BLL.Services
{
    public class GameService
    {
        private readonly IGameRepository _gameRepo;

        public GameService(IGameRepository gameRepo)
        {
            _gameRepo = gameRepo;
        }

        public async Task<List<Game>> GetAllGamesAsync()
        {
            return await _gameRepo.GetAllAsync();
        }

        public async Task<Game> GetGameByIdAsync(long id)
        {
            var game = await _gameRepo.GetByIdAsync(id) ?? throw new NotFoundException(ErrorCode.GameNotFound);
            return game;
        }

        public async Task<Game> CreateGameAsync(CreateGameRequest request)
        {
            var game = Game.Create(request.Name, request.ImageUrl, request.ImageRelativePath);
            game.IsActive = request.IsActive;
            game.Id = await _gameRepo.CreateAsync(game);
            return game;
        }

        public async Task<Game> UpdateGameAsync(long id, UpdateGameRequest request)
        {
            var game = await GetGameByIdAsync(id);
            request.Adapt(game);
            await _gameRepo.UpdateAsync(game);
            return game;
        }

        public async Task DeleteGameAsync(long id)
        {
            await GetGameByIdAsync(id);
            await _gameRepo.DeleteAsync(id);
        }
    }
}
