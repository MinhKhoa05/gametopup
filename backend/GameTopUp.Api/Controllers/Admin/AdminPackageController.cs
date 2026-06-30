using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Services.Games;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/packages")]
public sealed class AdminPackageController : ApiControllerBase
{
    private readonly PackageService _packageService;

    public AdminPackageController(PackageService packageService)
    {
        _packageService = packageService;
    }

    [HttpGet("/api/admin/games/{gameId:long}/packages")]
    public async Task<IActionResult> GetByGameId(long gameId)
    {
        var packages = await _packageService.GetAdminPackagesByGameIdAsync(gameId);
        return ApiOk(packages);
    }

    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [HttpPost("/api/admin/games/{gameId:long}/packages")]
    public async Task<IActionResult> Create(long gameId, [FromForm] CreatePackageRequest request)
    {
        var package = await _packageService.CreateAdminPackageAsync(gameId, request);
        return ApiCreated(package);
    }

    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromForm] UpdatePackageRequest request)
    {
        var package = await _packageService.UpdateAdminPackageAsync(id, request);
        return ApiOk(package);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePackage(long id)
    {
        await _packageService.DeletePackageAsync(id);
        return ApiOk();
    }
}
