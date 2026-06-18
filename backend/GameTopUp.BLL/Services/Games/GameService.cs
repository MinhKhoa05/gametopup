using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers.Games;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;

namespace GameTopUp.BLL.Services.Games;

public sealed class GameService
{
    private readonly IGameRepository _repository;

    public GameService(IGameRepository repository)
    {
        _repository = repository;
    }

    public Task<List<Game>> GetAllGamesAsync() => _repository.GetAllAsync();

    public async Task<List<PublicGameResponse>> GetPublicGamesAsync()
    {
        var games = await _repository.GetActiveAsync();
        return games.Select(GameMapper.ToPublicResponse).ToList();
    }

    public async Task<Game> GetGameByIdAsync(long id)
    {
        return await _repository.GetByIdAsync(id) ?? throw new NotFoundException(ErrorCode.GameNotFound);
    }

    public async Task<PublicGameResponse> GetPublicGameByIdAsync(long id)
    {
        var game = await GetGameByIdAsync(id);
        if (!game.IsActive)
        {
            throw new NotFoundException(ErrorCode.GameNotFound);
        }

        return GameMapper.ToPublicResponse(game);
    }

    public async Task<Game> CreateGameAsync(CreateGameRequest request)
    {
        var game = Game.Create(request.Name, request.ImageUrl, request.ImageRelativePath);
        game.IsActive = request.IsActive;
        game.Id = await _repository.CreateAsync(game);
        return game;
    }

    public async Task<Game> UpdateGameAsync(long id, UpdateGameRequest request)
    {
        var game = await GetGameByIdAsync(id);

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            game.Name = request.Name.Trim();
        }

        if (request.ImageUrl is not null)
        {
            game.ImageUrl = request.ImageUrl;
        }

        if (request.ImageRelativePath is not null)
        {
            game.ImageRelativePath = request.ImageRelativePath;
        }

        if (request.IsActive is not null)
        {
            game.IsActive = request.IsActive.Value;
        }

        game.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(game);
        return game;
    }

    public async Task DeleteGameAsync(long id)
    {
        await GetGameByIdAsync(id);
        await _repository.DeleteAsync(id);
    }
}
