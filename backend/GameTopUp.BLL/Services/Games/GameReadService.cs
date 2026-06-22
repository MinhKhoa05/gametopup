using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.DAL.Queries;

namespace GameTopUp.BLL.Services.Games;

public sealed class GameReadService
{
    private readonly GameQuery _gameQuery;

    public GameReadService(GameQuery gameQuery)
    {
        _gameQuery = gameQuery;
    }

    public async Task<List<GameResponse>> GetGamesAsync()
    {
        var games = await _gameQuery.GetGameQueryAsync();
        return games.Select(game => game.MapTo<GameResponse>()).ToList();
    }

    public async Task<List<AdminGameResponse>> GetAdminGamesAsync()
    {
        var games = await _gameQuery.GetAdminGameQueryAsync();
        return games.Select(game => game.MapTo<AdminGameResponse>()).ToList();
    }

    public async Task<GameResponse> GetGameByIdAsync(long id)
    {
        var game = (await _gameQuery.GetGameQueryAsync())
            .FirstOrDefault(game => game.Id == id)
            ?? throw new NotFoundException(ErrorCode.GameNotFound);

        return game.MapTo<GameResponse>();
    }
}
