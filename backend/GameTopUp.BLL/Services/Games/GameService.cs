using GameTopUp.BLL.Common;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Mappers;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;
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
            var game = Game.Create(request.Name);

            if (uploadedImage is not null)
            {
                game.ApplyImage(uploadedImage.Url, uploadedImage.RelativePath);
            }

            game.IsActive = request.IsActive;
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
                game.ApplyImage(uploadedImage.Url, uploadedImage.RelativePath);
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
