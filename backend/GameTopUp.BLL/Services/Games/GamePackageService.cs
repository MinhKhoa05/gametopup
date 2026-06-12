using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;

namespace GameTopUp.BLL.Services.Games;

public sealed class GamePackageService
{
    private readonly IGamePackageRepository _packageRepository;
    private readonly IGameRepository _gameRepository;

    public GamePackageService(IGamePackageRepository packageRepository, IGameRepository gameRepository)
    {
        _packageRepository = packageRepository;
        _gameRepository = gameRepository;
    }

    public Task<List<GamePackage>> GetAllPackagesAsync() => _packageRepository.GetAllAsync();

    public Task<List<GamePackage>> GetPackagesByGameIdAsync(long gameId) => _packageRepository.GetByGameIdAsync(gameId);

    public async Task<GamePackage> GetPackageByIdOrThrowAsync(long id)
    {
        return await _packageRepository.GetByIdAsync(id) ?? throw new NotFoundException(ErrorCode.GamePackageNotFound);
    }

    public async Task<GamePackage> CreatePackageAsync(CreateGamePackageRequest request)
    {
        await ValidateGameForPackageAsync(request.GameId);

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

    public async Task<GamePackage> UpdatePackageAsync(long id, UpdateGamePackageRequest request)
    {
        var package = await GetPackageByIdOrThrowAsync(id);

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
        return package;
    }

    public async Task DeletePackageAsync(long id)
    {
        await GetPackageByIdOrThrowAsync(id);
        await _packageRepository.DeleteAsync(id);
    }

    public async Task IncreaseStockAsync(long id, int quantity)
    {
        ValidateStockQuantity(quantity);

        var affectedRows = await _packageRepository.IncreaseStockAsync(id, quantity);
        if (affectedRows == 0)
        {
            throw new NotFoundException(ErrorCode.GamePackageNotFound);
        }
    }

    public async Task DecreaseStockAsync(long id, int quantity)
    {
        ValidateStockQuantity(quantity);

        var affectedRows = await _packageRepository.DecreaseStockAsync(id, quantity);
        if (affectedRows == 0)
        {
            throw new BusinessException(ErrorCode.InsufficientStock);
        }
    }

    public async Task<GamePackage> GetAvailablePackageAsync(long id, int quantity)
    {
        ValidateStockQuantity(quantity);

        var package = await GetPackageByIdOrThrowAsync(id);
        if (!package.IsActive)
        {
            throw new BusinessException(ErrorCode.GamePackageInactive);
        }

        if (package.StockQuantity < quantity)
        {
            throw new BusinessException(ErrorCode.InsufficientStock);
        }

        return package;
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

    private static void ValidateStockQuantity(int quantity)
    {
        if (quantity <= 0)
        {
            throw new BusinessException(ErrorCode.StockQuantityMustBePositive);
        }
    }
}
