using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Services.Games;
using GameTopUp.DAL.Entities.Games;
using Microsoft.AspNetCore.Http;

namespace GameTopUp.BLL.UseCases;

public sealed class GamePackageUseCase
{
    private readonly GamePackageService _packageService;
    private readonly IImageStorageService _imageStorageService;

    public GamePackageUseCase(GamePackageService packageService, IImageStorageService imageStorageService)
    {
        _packageService = packageService;
        _imageStorageService = imageStorageService;
    }

    public async Task<GamePackage> CreatePackageWithImageAsync(CreateGamePackageRequest request, IFormFile image)
    {
        if (image == null || image.Length == 0)
        {
            throw new BusinessException(ErrorCode.ImageRequired);
        }

        var storedImage = await _imageStorageService.UploadAsync(image, "game-packages");
        request.ImageUrl = storedImage.Url;
        request.ImageRelativePath = storedImage.RelativePath;

        return await _packageService.CreatePackageAsync(request);
    }

    public async Task<GamePackage> UpdatePackageWithImageAsync(long id, UpdateGamePackageRequest request, IFormFile? image)
    {
        var existingPackage = await _packageService.GetPackageByIdOrThrowAsync(id);

        if (image is not null && image.Length > 0)
        {
            var storedImage = await _imageStorageService.UploadAsync(image, "game-packages");
            request.ImageUrl = storedImage.Url;
            request.ImageRelativePath = storedImage.RelativePath;
        }
        else
        {
            request.ImageUrl ??= existingPackage.ImageUrl;
            request.ImageRelativePath ??= existingPackage.ImageRelativePath;
        }

        var updated = await _packageService.UpdatePackageAsync(id, request);

        if (!string.IsNullOrWhiteSpace(request.ImageUrl) && request.ImageUrl != existingPackage.ImageUrl)
        {
            await _imageStorageService.DeleteAsync(existingPackage.ImageRelativePath);
        }

        return updated;
    }

    public async Task<GamePackage> UpdatePackageAsync(long id, UpdateGamePackageRequest request)
    {
        var existingPackage = await _packageService.GetPackageByIdOrThrowAsync(id);
        var updated = await _packageService.UpdatePackageAsync(id, request);

        if (!string.IsNullOrWhiteSpace(request.ImageUrl) && request.ImageUrl != existingPackage.ImageUrl)
        {
            await _imageStorageService.DeleteAsync(existingPackage.ImageRelativePath);
        }

        return updated;
    }

    public async Task DeletePackageAsync(long id)
    {
        var existingPackage = await _packageService.GetPackageByIdOrThrowAsync(id);
        await _packageService.DeletePackageAsync(id);
        await _imageStorageService.DeleteAsync(existingPackage.ImageRelativePath);
    }
}
