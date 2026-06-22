using GameTopUp.BLL.Common;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.DTOs.Images;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Mappers;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;
namespace GameTopUp.BLL.Services.Games;

public sealed class GamePackageService
{
    private const string PackageImageFolder = "game-packages";

    private readonly IGamePackageRepository _packageRepository;
    private readonly IGameRepository _gameRepository;
    private readonly IImageStorageService _imageStorageService;

    public GamePackageService(
        IGamePackageRepository packageRepository,
        IGameRepository gameRepository,
        IImageStorageService imageStorageService)
    {
        _packageRepository = packageRepository;
        _gameRepository = gameRepository;
        _imageStorageService = imageStorageService;
    }

    public Task<List<GamePackage>> GetPackageEntitiesByGameIdAsync(long gameId) =>
        _packageRepository.GetByGameIdAsync(gameId);

    public async Task<List<GamePackageResponse>> GetPackagesByGameIdAsync(long gameId)
    {
        var packages = await _packageRepository.GetByGameIdAsync(gameId);

        return packages
            .Select(item => item.MapTo<GamePackageResponse>())
            .ToList();
    }

    public async Task<GamePackage> GetPackageByIdOrThrowAsync(long id)
    {
        return await _packageRepository.GetByIdAsync(id)
                    ?? throw new NotFoundException(ErrorCode.GamePackageNotFound);
    }

    public async Task<GamePackage> GetActivePackageByIdOrThrowAsync(long id)
    {
        var package = await GetPackageByIdOrThrowAsync(id);

        if (!package.IsActive)
        {
            throw new BusinessException(ErrorCode.GamePackageInactive);
        }

        return package;
    }

    public async Task<GamePackageResponse> GetPackageByIdAsync(long id)
    {
        var package = await GetActivePackageByIdOrThrowAsync(id);
        return package.MapTo<GamePackageResponse>();
    }

    public async Task ReservePackageAsync(long packageId)
    {
        var affectedRows = await _packageRepository.DecreaseStockAsync(packageId, 1);

        if (affectedRows == 0)
        {
            throw new BusinessException(ErrorCode.PackageOutOfStock);
        }
    }

    public async Task RestorePackageAsync(long packageId)
    {
        var affectedRows = await _packageRepository.IncreaseStockAsync(packageId, 1);

        if (affectedRows == 0)
        {
            throw new NotFoundException(ErrorCode.GamePackageNotFound);
        }
    }

    public async Task<GamePackage> CreatePackageAsync(long gameId, CreateGamePackageRequest request)
    {
        await EnsureGameExistsAsync(gameId);

        var packageName = InputTextNormalizer.Required(request.Name, ErrorCode.BadRequest);

        var uploadedImage = await _imageStorageService.UploadAsync(request.ImageFile, PackageImageFolder);

        try
        {
            var package = GamePackage.Create(
                packageName,
                gameId,
                request.SalePrice,
                request.OriginalPrice,
                request.ImportPrice,
                request.AvailableSlots);

            package.IsActive = request.IsActive;
            ApplyImage(package, uploadedImage);

            package.Id = await _packageRepository.CreateAsync(package);
            return package;
        }
        catch
        {
            await _imageStorageService.DeleteAsync(uploadedImage?.RelativePath);
            throw;
        }
    }

    public async Task<GamePackage> UpdatePackageAsync(long id, UpdateGamePackageRequest request)
    {
        var package = await GetPackageByIdOrThrowAsync(id);
        var previousImagePath = package.ImageRelativePath;

        var uploadedImage = await _imageStorageService.UploadAsync(request.ImageFile, PackageImageFolder);

        try
        {
            request.ApplyTo(package);
            ApplyImage(package, uploadedImage);

            package.UpdatedAt = DateTime.UtcNow;

            await _packageRepository.UpdateAsync(package);

            if (uploadedImage is not null)
            {
                await _imageStorageService.DeleteAsync(previousImagePath);
            }

            return package;
        }
        catch
        {
            await _imageStorageService.DeleteAsync(uploadedImage?.RelativePath);
            throw;
        }
    }

    public async Task DeletePackageAsync(long id)
    {
        var package = await GetPackageByIdOrThrowAsync(id);

        await _packageRepository.DeleteAsync(id);
        await _imageStorageService.DeleteAsync(package.ImageRelativePath);
    }

    private static void ApplyImage(GamePackage package, ImageStorageResult? image)
    {
        if (image is null)
        {
            return;
        }

        package.ImageUrl = image.Url;
        package.ImageRelativePath = image.RelativePath;
    }

    private async Task EnsureGameExistsAsync(long gameId)
    {
        if (await _gameRepository.GetByIdAsync(gameId) is null)
        {
            throw new NotFoundException(ErrorCode.GameNotFound);
        }
    }
}
