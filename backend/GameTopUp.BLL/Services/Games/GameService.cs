using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Services.Images;
using GameTopUp.BLL.Utilities;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
namespace GameTopUp.BLL.Services.Games;

public sealed class GameService
{
    private readonly IGameRepository _repository;
    private readonly IImageStorageService _imageStorageService;

    public GameService(IGameRepository repository, IImageStorageService imageStorageService)
    {
        _repository = repository;
        _imageStorageService = imageStorageService;
    }

    public async Task<Game> GetGameByIdOrThrowAsync(long id)
    {
        return await _repository.GetByIdAsync(id) ?? throw new NotFoundException(ErrorCode.GameNotFound);
    }

    public async Task<AdminGameResponse> CreateGameAsync(CreateGameRequest request)
    {
        request.Name = InputTextNormalizer.Required(request.Name, ErrorCode.BadRequest);
        var uploadedImage = await _imageStorageService.UploadAsync(request.ImageFile, "games");

        try
        {
            var game = request.MapTo<Game>();
            var now = DateTimeOffset.UtcNow;
            game.CreatedAt = now;
            game.UpdatedAt = now;
            game.ImageUrl = string.Empty;
            game.ImageRelativePath = null;

            if (uploadedImage is not null)
            {
                game.ImageUrl = uploadedImage.Url;
                game.ImageRelativePath = uploadedImage.RelativePath;
            }

            game.Id = await _repository.CreateAsync(game);
            return game.MapTo<AdminGameResponse>();
        }
        catch
        {
            await _imageStorageService.DeleteAsync(uploadedImage?.RelativePath);
            throw;
        }
    }

    public async Task<AdminGameResponse> UpdateGameAsync(long id, UpdateGameRequest request)
    {
        var game = await GetGameByIdOrThrowAsync(id);
        var previousImageRelativePath = game.ImageRelativePath;
        var uploadedImage = await _imageStorageService.UploadAsync(request.ImageFile, "games");

        try
        {
            request.ApplyTo(game);

            if (uploadedImage is not null)
            {
                game.ImageUrl = uploadedImage.Url;
                game.ImageRelativePath = uploadedImage.RelativePath;
            }

            game.UpdatedAt = DateTimeOffset.UtcNow;
            await _repository.UpdateAsync(game);

            if (uploadedImage is not null)
            {
                await _imageStorageService.DeleteAsync(previousImageRelativePath);
            }

            return game.MapTo<AdminGameResponse>();
        }
        catch
        {
            await _imageStorageService.DeleteAsync(uploadedImage?.RelativePath);
            throw;
        }
    }

    public async Task DeleteGameAsync(long id)
    {
        var existingGame = await GetGameByIdOrThrowAsync(id);
        await _repository.DeleteAsync(id);
        await _imageStorageService.DeleteAsync(existingGame.ImageRelativePath);
    }
}
