using GameTopUp.BLL.DTOs.Games;
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
        if (image == null || image.Length == 0)
        {
            throw new BusinessException(ErrorCode.ImageRequired);
        }

        var storedImage = await _imageStorageService.UploadAsync(image, "games");
        request.ImageUrl = storedImage.Url;
        request.ImageRelativePath = storedImage.RelativePath;

        return await _gameService.CreateGameAsync(request);
    }

    public async Task<Game> UpdateGameWithImageAsync(long id, UpdateGameRequest request, IFormFile? image)
    {
        var existingGame = await _gameService.GetGameByIdAsync(id);
        var previousImageUrl = existingGame.ImageUrl;
        var previousImageRelativePath = existingGame.ImageRelativePath;

        if (image is not null && image.Length > 0)
        {
            var storedImage = await _imageStorageService.UploadAsync(image, "games");
            request.ImageUrl = storedImage.Url;
            request.ImageRelativePath = storedImage.RelativePath;
        }
        else
        {
            request.ImageUrl ??= existingGame.ImageUrl;
            request.ImageRelativePath ??= existingGame.ImageRelativePath;
        }

        var updated = await _gameService.UpdateGameAsync(id, request);

        if (!string.IsNullOrWhiteSpace(request.ImageUrl) && request.ImageUrl != previousImageUrl)
        {
            await _imageStorageService.DeleteAsync(previousImageRelativePath);
        }

        return updated;
    }

    public async Task<Game> UpdateGameAsync(long id, UpdateGameRequest request)
    {
        var existingGame = await _gameService.GetGameByIdAsync(id);
        var previousImageUrl = existingGame.ImageUrl;
        var previousImageRelativePath = existingGame.ImageRelativePath;
        var updated = await _gameService.UpdateGameAsync(id, request);

        if (!string.IsNullOrWhiteSpace(request.ImageUrl) && request.ImageUrl != previousImageUrl)
        {
            await _imageStorageService.DeleteAsync(previousImageRelativePath);
        }

        return updated;
    }

    public async Task DeleteGameAsync(long id)
    {
        var existingGame = await _gameService.GetGameByIdAsync(id);
        await _gameService.DeleteGameAsync(id);
        await _imageStorageService.DeleteAsync(existingGame.ImageRelativePath);
    }
}
