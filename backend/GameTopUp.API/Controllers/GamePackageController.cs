using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;

namespace GameTopUp.API.Controllers
{
    [Route("api/game-packages")]
    [ApiController]
    public class GamePackageController : ApiControllerBase
    {
        private readonly GamePackageService _packageService;

        public GamePackageController(GamePackageService packageService)
        {
            _packageService = packageService;
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
            return ApiCreated(package, "Tạo gói nạp thành công.");
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("with-image")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(5 * 1024 * 1024)]
        public async Task<IActionResult> CreatePackageWithImage(
            [FromForm] CreateGamePackageRequest request,
            [FromForm] IFormFile image)
        {
            if (image == null)
            {
                throw new BusinessException(ErrorCodes.ImageRequired);
            }

            await using var imageStream = image.OpenReadStream();
            var package = await _packageService.CreatePackageWithImageAsync(
                request,
                imageStream,
                image.FileName,
                image.ContentType,
                image.Length);

            return ApiCreated(package, "Tạo gói nạp kèm ảnh thành công.");
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePackage(long id, [FromBody] UpdateGamePackageRequest request)
        {
            var package = await _packageService.UpdatePackageAsync(id, request);
            return ApiOk(package, "Cập nhật thông tin gói nạp thành công.");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePackage(long id)
        {
            await _packageService.DeletePackageAsync(id);
            return ApiOk(null, "Xóa gói nạp thành công.");
        }
    }
}
