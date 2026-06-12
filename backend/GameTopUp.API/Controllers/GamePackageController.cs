using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.Services.Games;
using GameTopUp.BLL.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers;

[Route("api/game-packages")]
public sealed class GamePackageController : ApiControllerBase
{
    private readonly GamePackageService _packageService;
    private readonly GamePackageUseCase _packageUseCase;

    public GamePackageController(GamePackageService packageService, GamePackageUseCase packageUseCase)
    {
        _packageService = packageService;
        _packageUseCase = packageUseCase;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPackages()
    {
        var packages = await _packageService.GetAllPackagesAsync();
        return ApiOk(packages);
    }

    [HttpGet("game/{gameId}")]
    public async Task<IActionResult> GetPackagesByGameId(long gameId)
    {
        var packages = await _packageService.GetPackagesByGameIdAsync(gameId);
        return ApiOk(packages);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPackageById(long id)
    {
        var package = await _packageService.GetPackageByIdOrThrowAsync(id);
        return ApiOk(package);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreatePackage([FromBody] CreateGamePackageRequest request)
    {
        var package = await _packageService.CreatePackageAsync(request);
        return ApiCreated(package, "Package created successfully.");
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("with-image")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> CreatePackageWithImage([FromForm] CreateGamePackageRequest request, [FromForm] IFormFile image)
    {
        var package = await _packageUseCase.CreatePackageWithImageAsync(request, image);
        return ApiCreated(package, "Package created with image successfully.");
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePackage(long id, [FromBody] UpdateGamePackageRequest request)
    {
        var package = await _packageUseCase.UpdatePackageAsync(id, request);
        return ApiOk(package, "Package updated successfully.");
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/with-image")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UpdatePackageWithImage(long id, [FromForm] UpdateGamePackageRequest request, [FromForm] IFormFile? image)
    {
        var package = await _packageUseCase.UpdatePackageWithImageAsync(id, request, image);
        return ApiOk(package, "Package updated with image successfully.");
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePackage(long id)
    {
        await _packageUseCase.DeletePackageAsync(id);
        return ApiOk(null, "Package deleted successfully.");
    }
}
