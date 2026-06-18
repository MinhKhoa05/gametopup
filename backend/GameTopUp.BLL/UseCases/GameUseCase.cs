using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.DTOs.Images;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Services.Games;
using GameTopUp.DAL.Entities.Games;
using Microsoft.AspNetCore.Http;

namespace GameTopUp.BLL.UseCases;

public sealed class GameUseCase
{
    private readonly GameService _gameService;
    private readonly IImageStorageService _imageStorageService;

    public GameUseCase(GameService gameService, IImageStorageService imageStorageService)
    {
        _gameService = gameService;
        _imageStorageService = imageStorageService;
    }

    public async Task<Game> CreateGameWithImageAsync(CreateGameRequest request, IFormFile image)
    {
        request.ImageFile = image;
        return await CreateGameAsync(request);
    }

    public async Task<Game> CreateGameAsync(CreateGameRequest request)
    {
        ImageStorageResult? uploadedImage = null;

        if (request.ImageFile is not null)
        {
            if (request.ImageFile.Length == 0)
            {
                throw new BusinessException(ErrorCode.ImageRequired);
            }

            uploadedImage = await _imageStorageService.UploadAsync(request.ImageFile, "games");
            request.ImageUrl = uploadedImage.Url;
            request.ImageRelativePath = uploadedImage.RelativePath;
        }

        try
        {
            return await _gameService.CreateGameAsync(request);
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

    public async Task<Game> UpdateGameWithImageAsync(long id, UpdateGameRequest request, IFormFile? image)
    {
        request.ImageFile = image;
        return await UpdateGameAsync(id, request);
    }

    public async Task<Game> UpdateGameAsync(long id, UpdateGameRequest request)
    {
        var existingGame = await _gameService.GetGameByIdAsync(id);
        var previousImageUrl = existingGame.ImageUrl;
        var previousImageRelativePath = existingGame.ImageRelativePath;
        ImageStorageResult? uploadedImage = null;

        if (request.ImageFile is not null)
        {
            if (request.ImageFile.Length == 0)
            {
                throw new BusinessException(ErrorCode.ImageRequired);
            }

            uploadedImage = await _imageStorageService.UploadAsync(request.ImageFile, "games");
            request.ImageUrl = uploadedImage.Url;
            request.ImageRelativePath = uploadedImage.RelativePath;
        }
        else
        {
            request.ImageUrl ??= existingGame.ImageUrl;
            request.ImageRelativePath ??= existingGame.ImageRelativePath;
        }

        try
        {
            var updated = await _gameService.UpdateGameAsync(id, request);

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

    public async Task DeleteGameAsync(long id)
    {
        var existingGame = await _gameService.GetGameByIdAsync(id);
        await _gameService.DeleteGameAsync(id);
        await _imageStorageService.DeleteAsync(existingGame.ImageRelativePath);
    }
}
