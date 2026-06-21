using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.DAL.Interfaces.Games;
using GameTopUp.DAL.Queries;

namespace GameTopUp.BLL.Services.Games;

public sealed class GameReadService
{
    private readonly IGameRepository _repository;
    private readonly GameQuery _gameQuery;

    public GameReadService(IGameRepository repository, GameQuery gameQuery)
    {
        _repository = repository;
        _gameQuery = gameQuery;
    }

    public async Task<List<PublicGameResponse>> GetPublicGamesAsync()
    {
        var games = await _repository.GetActiveAsync();
        return games.Select(game => game.MapTo<PublicGameResponse>()).ToList();
    }

    public Task<List<AdminGameSummaryRow>> GetAdminGameSummariesAsync() =>
        _gameQuery.GetAdminSummaryAsync();

    public async Task<PublicGameResponse> GetPublicGameByIdAsync(long id)
    {
        var game = await _repository.GetByIdAsync(id) ?? throw new NotFoundException(ErrorCode.GameNotFound);
        return game.MapTo<PublicGameResponse>();
    }
}
