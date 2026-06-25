using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.Services.Games;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/packages")]
public sealed class AdminGamePackageController : ApiControllerBase
{
    private readonly GamePackageService _packageService;

    public AdminGamePackageController(GamePackageService packageService)
    {
        _packageService = packageService;
    }

    [HttpGet("/api/admin/games/{gameId:long}/packages")]
    public async Task<IActionResult> GetByGameId(long gameId)
    {
        var packages = await _packageService.GetPackageEntitiesByGameIdAsync(gameId);
        return ApiOk(packages);
    }

    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [HttpPost("/api/admin/games/{gameId:long}/packages")]
    public async Task<IActionResult> Create(long gameId, [FromForm] CreateGamePackageRequest request)
    {
        var package = await _packageService.CreatePackageAsync(gameId, request);
        return ApiCreated(package);
    }

    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromForm] UpdateGamePackageRequest request)
    {
        var package = await _packageService.UpdatePackageAsync(id, request);
        return ApiOk(package);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePackage(long id)
    {
        await _packageService.DeletePackageAsync(id);
        return ApiOk();
    }
}
