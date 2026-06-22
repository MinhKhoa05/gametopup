using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Services.Games;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/games")]
public sealed class AdminGameController : ApiControllerBase
{
    private readonly GameService _gameService;
    private readonly GameReadService _gameReadService;

    public AdminGameController(GameService gameService, GameReadService gameReadService)
    {
        _gameService = gameService;
        _gameReadService = gameReadService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAdminGames()
    {
        var games = await _gameReadService.GetAdminGamesAsync();
        return ApiOk(games);
    }

    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateGameRequest request)
    {
        var game = await _gameService.CreateGameAsync(request);
        return ApiCreated(game);
    }

    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromForm] UpdateGameRequest request)
    {
        var game = await _gameService.UpdateGameAsync(id, request);
        return ApiOk(game);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGame(long id)
    {
        await _gameService.DeleteGameAsync(id);
        return ApiOk();
    }
}
