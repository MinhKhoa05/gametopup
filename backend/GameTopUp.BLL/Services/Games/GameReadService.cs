using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Services.Images;
using GameTopUp.DAL.Queries;

namespace GameTopUp.BLL.Services.Games;

public sealed class GameReadService
{
    private readonly GameQuery _gameQuery;
    private readonly PublicImageUrlBuilder _imageUrlBuilder;

    public GameReadService(GameQuery gameQuery, PublicImageUrlBuilder imageUrlBuilder)
    {
        _gameQuery = gameQuery;
        _imageUrlBuilder = imageUrlBuilder;
    }

    public async Task<List<GameResponse>> GetGamesAsync()
    {
        var games = await _gameQuery.GetGameQueryAsync();
        return games.Select(game => WithPublicImageUrl(game.MapTo<GameResponse>())).ToList();
    }

    public async Task<List<AdminGameResponse>> GetAdminGamesAsync()
    {
        var games = await _gameQuery.GetAdminGameQueryAsync();
        return games.Select(game => WithPublicImageUrl(game.MapTo<AdminGameResponse>())).ToList();
    }

    public async Task<GameResponse> GetGameByIdAsync(long id)
    {
        var game = (await _gameQuery.GetGameQueryAsync())
            .FirstOrDefault(game => game.Id == id)
            ?? throw new NotFoundException(ErrorCode.GameNotFound);

        return WithPublicImageUrl(game.MapTo<GameResponse>());
    }

    private GameResponse WithPublicImageUrl(GameResponse game)
    {
        game.ImageUrl = _imageUrlBuilder.Build(game.ImageUrl);
        return game;
    }

    private AdminGameResponse WithPublicImageUrl(AdminGameResponse game)
    {
        game.ImageUrl = _imageUrlBuilder.Build(game.ImageUrl);
        return game;
    }
}
