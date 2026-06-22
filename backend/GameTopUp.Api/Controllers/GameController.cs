using GameTopUp.BLL.Services.Games;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Route("api/games")]
public sealed class GameController : ApiControllerBase
{
    private readonly GameReadService _gameReadService;

    public GameController(GameReadService gameReadService)
    {
        _gameReadService = gameReadService;
    }

    [HttpGet]
    public async Task<IActionResult> GetGames()
    {
        var games = await _gameReadService.GetGamesAsync();
        return ApiOk(games);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetGameById(long id)
    {
        var game = await _gameReadService.GetGameByIdAsync(id);
        return ApiOk(game);
    }
}
