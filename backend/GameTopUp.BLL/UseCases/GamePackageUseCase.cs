using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.DTOs.Images;
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
        request.ImageFile = image;
        return await CreatePackageAsync(request);
    }

    public async Task<GamePackage> CreatePackageAsync(CreateGamePackageRequest request)
    {
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
            return await _packageService.CreatePackageAsync(request);
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

    public async Task<GamePackage> UpdatePackageWithImageAsync(long id, UpdateGamePackageRequest request, IFormFile? image)
    {
        request.ImageFile = image;
        return await UpdatePackageAsync(id, request);
    }

    public async Task<GamePackage> UpdatePackageAsync(long id, UpdateGamePackageRequest request)
    {
        var existingPackage = await _packageService.GetPackageByIdOrThrowAsync(id);
        var previousImageUrl = existingPackage.ImageUrl;
        var previousImageRelativePath = existingPackage.ImageRelativePath;
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
            request.ImageUrl ??= existingPackage.ImageUrl;
            request.ImageRelativePath ??= existingPackage.ImageRelativePath;
        }

        try
        {
            var updated = await _packageService.UpdatePackageAsync(id, request);

            if (!string.IsNullOrWhiteSpace(request.ImageUrl) && request.ImageUrl != previousImageUrl)
            {
                await _imageStorageService.DeleteAsync(previousImageRelativePath);
            }

            return updated;
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
        var existingPackage = await _packageService.GetPackageByIdOrThrowAsync(id);
        await _packageService.DeletePackageAsync(id);
        await _imageStorageService.DeleteAsync(existingPackage.ImageRelativePath);
    }
}
