using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.Services.Games;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/game-packages")]
public sealed class AdminGamePackageController : ApiControllerBase
{
    private readonly GamePackageService _packageService;

    public AdminGamePackageController(GamePackageService packageService)
    {
        _packageService = packageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var packages = await _packageService.GetAllPackagesAsync();
        return ApiOk(packages);
    }

    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateGamePackageRequest request)
    {
        var package = await _packageService.CreatePackageAsync(request);
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
