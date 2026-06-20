using GameTopUp.BLL.Common;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Mappers;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;
using GameTopUp.DAL.Queries;
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

    public async Task<Game> GetGameByIdOrThrowAsync(long id)
    {
        return await _repository.GetByIdAsync(id) ?? throw new NotFoundException(ErrorCode.GameNotFound);
    }

    public async Task<PublicGameResponse> GetPublicGameByIdAsync(long id)
    {
        var game = await GetGameByIdOrThrowAsync(id);
        return game.MapTo<PublicGameResponse>();
    }

    public async Task<Game> CreateGameAsync(CreateGameRequest request)
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
            return game;
        }
        catch
        {
            await _imageStorageService.DeleteAsync(uploadedImage?.RelativePath);
            throw;
        }
    }

    public async Task<Game> UpdateGameAsync(long id, UpdateGameRequest request)
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

            game.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(game);

            if (uploadedImage is not null)
            {
                await _imageStorageService.DeleteAsync(previousImageRelativePath);
            }

            return game;
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
