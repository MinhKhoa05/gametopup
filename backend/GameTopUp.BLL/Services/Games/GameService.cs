using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.DTOs.Images;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Mappers;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;
using GameTopUp.DAL.Queries;
using Microsoft.AspNetCore.Http;

namespace GameTopUp.BLL.Services.Games;

public sealed class GameService
{
    private readonly IGameRepository _repository;
    private readonly IImageStorageService _imageStorageService;
    private readonly GameQuery _gameQuery;

    public GameService(IGameRepository repository, IImageStorageService imageStorageService, GameQuery gameQuery)
    {
        _repository = repository;
        _imageStorageService = imageStorageService;
        _gameQuery = gameQuery;
    }

    public async Task<List<PublicGameResponse>> GetPublicGamesAsync()
    {
        var games = await _repository.GetActiveAsync();
        return games.Select(game => game.MapTo<PublicGameResponse>()).ToList();
    }

    public async Task<List<AdminGameSummaryRow>> GetAdminGameSummariesAsync()
    {
        return await _gameQuery.GetAdminSummaryAsync();
    }

    public async Task<Game> GetGameByIdAsync(long id)
    {
        return await _repository.GetByIdAsync(id) ?? throw new NotFoundException(ErrorCode.GameNotFound);
    }

    public async Task<PublicGameResponse> GetPublicGameByIdAsync(long id)
    {
        var game = await GetGameByIdAsync(id);
        if (!game.IsActive)
        {
            throw new NotFoundException(ErrorCode.GameNotFound);
        }

        return game.MapTo<PublicGameResponse>();
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
            var game = Game.Create(request.Name, request.ImageUrl, request.ImageRelativePath);
            game.IsActive = request.IsActive;
            game.Id = await _repository.CreateAsync(game);
            return game;
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

    public async Task<Game> UpdateGameAsync(long id, UpdateGameRequest request)
    {
        var game = await GetGameByIdAsync(id);
        var previousImageUrl = game.ImageUrl;
        var previousImageRelativePath = game.ImageRelativePath;
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
            request.ImageUrl ??= game.ImageUrl;
            request.ImageRelativePath ??= game.ImageRelativePath;
        }

        try
        {
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                game.Name = request.Name.Trim();
            }

            if (request.ImageUrl is not null)
            {
                game.ImageUrl = request.ImageUrl;
            }

            if (request.ImageRelativePath is not null)
            {
                game.ImageRelativePath = request.ImageRelativePath;
            }

            if (request.IsActive is not null)
            {
                game.IsActive = request.IsActive.Value;
            }

            game.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(game);

            if (!string.IsNullOrWhiteSpace(request.ImageUrl) && request.ImageUrl != previousImageUrl)
            {
                await _imageStorageService.DeleteAsync(previousImageRelativePath);
            }

            return game;
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
        var existingGame = await GetGameByIdAsync(id);
        await _repository.DeleteAsync(id);
        await _imageStorageService.DeleteAsync(existingGame.ImageRelativePath);
    }
}
