using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Queries.Games;
using GameTopUp.BLL.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/games")]
public sealed class AdminGameController : ApiControllerBase
{
    private readonly GameUseCase _gameUseCase;
    private readonly AdminGameQuery _gameQuery;

    public AdminGameController(GameUseCase gameUseCase, AdminGameQuery gameQuery)
    {
        _gameUseCase = gameUseCase;
        _gameQuery = gameQuery;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllGames()
    {
        var games = await _gameQuery.GetAllAsync();
        return ApiOk(games);
    }

    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateGameRequest request)
    {
        var game = await _gameUseCase.CreateGameAsync(request);
        return ApiCreated(game, "Game created successfully.");
    }

    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromForm] UpdateGameRequest request)
    {
        var game = await _gameUseCase.UpdateGameAsync(id, request);
        return ApiOk(game, "Game updated successfully.");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGame(long id)
    {
        await _gameUseCase.DeleteGameAsync(id);
        return ApiOk(null, "Game deleted successfully.");
    }
}
