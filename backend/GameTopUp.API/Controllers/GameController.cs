using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Services.Games;
using GameTopUp.BLL.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Route("api/games")]
public sealed class GameController : ApiControllerBase
{
    private readonly GameService _gameService;
    private readonly GameUseCase _gameUseCase;

    public GameController(GameService gameService, GameUseCase gameUseCase)
    {
        _gameService = gameService;
        _gameUseCase = gameUseCase;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllGames()
    {
        var games = await _gameService.GetAllGamesAsync();
        return ApiOk(games);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetGameById(long id)
    {
        var game = await _gameService.GetGameByIdAsync(id);
        return ApiOk(game);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateGame([FromBody] CreateGameRequest request)
    {
        var game = await _gameService.CreateGameAsync(request);
        return ApiCreated(game, "Game created successfully.");
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("with-image")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> CreateGameWithImage([FromForm] CreateGameRequest request, [FromForm] IFormFile image)
    {
        var game = await _gameUseCase.CreateGameWithImageAsync(request, image);
        return ApiCreated(game, "Game created with image successfully.");
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGame(long id, [FromBody] UpdateGameRequest request)
    {
        var game = await _gameUseCase.UpdateGameAsync(id, request);
        return ApiOk(game, "Game updated successfully.");
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/with-image")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UpdateGameWithImage(long id, [FromForm] UpdateGameRequest request, [FromForm] IFormFile? image)
    {
        var game = await _gameUseCase.UpdateGameWithImageAsync(id, request, image);
        return ApiOk(game, "Game updated with image successfully.");
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGame(long id)
    {
        await _gameUseCase.DeleteGameAsync(id);
        return ApiOk(null, "Game deleted successfully.");
    }
}
