using GameTopUp.BLL.Services.Games;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Route("api/packages")]
public sealed class GamePackageController : ApiControllerBase
{
    private readonly GamePackageService _packageService;

    public GamePackageController(GamePackageService packageService)
    {
        _packageService = packageService;
    }

    [HttpGet("/api/games/{gameId:long}/packages")]
    public async Task<IActionResult> GetPackagesByGame(long gameId)
    {
        var packages = await _packageService.GetPackagesByGameIdAsync(gameId);
        return ApiOk(packages);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetPackageById(long id)
    {
        var package = await _packageService.GetPackageByIdAsync(id);
        return ApiOk(package);
    }
}
