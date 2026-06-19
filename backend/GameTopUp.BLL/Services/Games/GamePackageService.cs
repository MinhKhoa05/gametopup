using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.DTOs.Images;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Mappers;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;
using Microsoft.AspNetCore.Http;

namespace GameTopUp.BLL.Services.Games;

public sealed class GamePackageService
{
    private readonly IGamePackageRepository _packageRepository;
    private readonly IGameRepository _gameRepository;
    private readonly IImageStorageService _imageStorageService;

    public GamePackageService(IGamePackageRepository packageRepository, IGameRepository gameRepository, IImageStorageService imageStorageService)
    {
        _packageRepository = packageRepository;
        _gameRepository = gameRepository;
        _imageStorageService = imageStorageService;
    }

    public Task<List<GamePackage>> GetAllPackagesAsync() => _packageRepository.GetAllAsync();

    public Task<List<GamePackage>> GetPackagesByGameIdAsync(long gameId) => _packageRepository.GetByGameIdAsync(gameId);

    public async Task<List<PublicGamePackageResponse>> GetPublicPackagesByGameIdAsync(long gameId)
    {
        var packages = await _packageRepository.GetByGameIdAsync(gameId);
        return packages.Select(package => package.MapTo<PublicGamePackageResponse>()).ToList();
    }

    public async Task<GamePackage> GetPackageByIdOrThrowAsync(long id)
    {
        return await _packageRepository.GetByIdAsync(id) ?? throw new NotFoundException(ErrorCode.GamePackageNotFound);
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

    public async Task<PublicGamePackageResponse> GetPublicPackageByIdOrThrowAsync(long id)
    {
        var package = await GetPackageByIdOrThrowAsync(id);
        if (!package.IsActive)
        {
            throw new NotFoundException(ErrorCode.GamePackageNotFound);
        }

        return package.MapTo<PublicGamePackageResponse>();
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

    public async Task<GamePackage> CreatePackageAsync(CreateGamePackageRequest request)
    {
        await ValidateGameForPackageAsync(request.GameId);
        ImageStorageResult? uploadedImage = null;

        if (request.ImageFile is not null)
        {
            if (request.ImageFile.Length == 0)
            {
                throw new BusinessException(ErrorCode.ImageRequired);
            }

            uploadedImage = await _imageStorageService.UploadAsync(request.ImageFile, "game-packages");
            request.ImageUrl = uploadedImage.Url;
            request.ImageRelativePath = uploadedImage.RelativePath;
        }

        try
        {
            var package = GamePackage.Create(
                request.Name,
                request.GameId,
                request.SalePrice,
                request.OriginalPrice,
                request.ImportPrice,
                request.StockQuantity);

            package.ImageUrl = request.ImageUrl;
            package.ImageRelativePath = request.ImageRelativePath;
            package.IsActive = request.IsActive;
            package.Id = await _packageRepository.CreateAsync(package);
            return package;
        }
        catch
        {
            if (uploadedImage is not null)
            {
                await _imageStorageService.DeleteAsync(uploadedImage.RelativePath);
            }

            throw;
        }
    }

    public async Task<GamePackage> UpdatePackageAsync(long id, UpdateGamePackageRequest request)
    {
        var package = await GetPackageByIdOrThrowAsync(id);
        var previousImageUrl = package.ImageUrl;
        var previousImageRelativePath = package.ImageRelativePath;
        ImageStorageResult? uploadedImage = null;

        if (request.ImageFile is not null)
        {
            if (request.ImageFile.Length == 0)
            {
                throw new BusinessException(ErrorCode.ImageRequired);
            }

            uploadedImage = await _imageStorageService.UploadAsync(request.ImageFile, "game-packages");
            request.ImageUrl = uploadedImage.Url;
            request.ImageRelativePath = uploadedImage.RelativePath;
        }
        else
        {
            request.ImageUrl ??= package.ImageUrl;
            request.ImageRelativePath ??= package.ImageRelativePath;
        }

        try
        {
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                package.Name = request.Name.Trim();
            }

            if (request.ImageUrl is not null)
            {
                package.ImageUrl = request.ImageUrl;
            }

            if (request.ImageRelativePath is not null)
            {
                package.ImageRelativePath = request.ImageRelativePath;
            }

            if (request.SalePrice is not null)
            {
                package.SalePrice = request.SalePrice.Value;
            }

            if (request.OriginalPrice is not null)
            {
                package.OriginalPrice = request.OriginalPrice.Value;
            }

            if (request.ImportPrice is not null)
            {
                package.ImportPrice = request.ImportPrice.Value;
            }

            if (request.StockQuantity is not null)
            {
                if (request.StockQuantity.Value < 0)
                {
                    throw new BusinessException(ErrorCode.StockQuantityMustBePositive);
                }

                package.StockQuantity = request.StockQuantity.Value;
            }

            if (request.IsActive is not null)
            {
                package.IsActive = request.IsActive.Value;
            }

            package.UpdatedAt = DateTime.UtcNow;
            await _packageRepository.UpdateAsync(package);

            if (!string.IsNullOrWhiteSpace(request.ImageUrl) && request.ImageUrl != previousImageUrl)
            {
                await _imageStorageService.DeleteAsync(previousImageRelativePath);
            }

            return package;
        }
        catch
        {
            if (uploadedImage is not null)
            {
                await _imageStorageService.DeleteAsync(uploadedImage.RelativePath);
            }

            throw;
        }
    }

    public async Task DeletePackageAsync(long id)
    {
        var package = await GetPackageByIdOrThrowAsync(id);
        await _packageRepository.DeleteAsync(id);
        await _imageStorageService.DeleteAsync(package.ImageRelativePath);
    }

    private async Task ValidateGameForPackageAsync(long gameId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game is null)
        {
            throw new NotFoundException(ErrorCode.GameNotFound);
        }

        if (!game.IsActive)
        {
            throw new BusinessException(ErrorCode.InactiveGameCannotAddPackage);
        }
    }
}
