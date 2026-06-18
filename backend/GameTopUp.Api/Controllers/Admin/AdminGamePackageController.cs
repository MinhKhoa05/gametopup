using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameTopUp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/game-packages")]
public sealed class AdminGamePackageController : ApiControllerBase
{
    private readonly GamePackageUseCase _packageUseCase;

    public AdminGamePackageController(GamePackageUseCase packageUseCase)
    {
        _packageUseCase = packageUseCase;
    }

    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateGamePackageRequest request)
    {
        var package = await _packageUseCase.CreatePackageAsync(request);
        return ApiCreated(package, "Package created successfully.");
    }

    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromForm] UpdateGamePackageRequest request)
    {
        var package = await _packageUseCase.UpdatePackageAsync(id, request);
        return ApiOk(package, "Package updated successfully.");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePackage(long id)
    {
        await _packageUseCase.DeletePackageAsync(id);
        return ApiOk(null, "Package deleted successfully.");
    }
}
