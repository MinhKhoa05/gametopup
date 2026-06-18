using GameTopUp.BLL.Services.Games;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Route("api/games")]
public sealed class GameController : ApiControllerBase
{
    private readonly GameService _gameService;

    public GameController(GameService gameService)
    {
        _gameService = gameService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllGames()
    {
        var games = await _gameService.GetPublicGamesAsync();
        return ApiOk(games);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetGameById(long id)
    {
        var game = await _gameService.GetPublicGameByIdAsync(id);
        return ApiOk(game);
    }
}
