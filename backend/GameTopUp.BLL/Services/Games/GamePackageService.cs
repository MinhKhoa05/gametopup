using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.DAL.Interfaces.Games;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Utils;
using GameTopUp.DAL.Entities;
using Mapster;

namespace GameTopUp.BLL.Services
{
    public class GamePackageService
    {
        private readonly IGamePackageRepository _packageRepo;
        private readonly IGameRepository _gameRepo;
        private readonly ICloudinaryUploader _cloudinaryUploader;

        public GamePackageService(
            IGamePackageRepository packageRepo,
            IGameRepository gameRepo,
            ICloudinaryUploader cloudinaryUploader)
        {
            _packageRepo = packageRepo;
            _gameRepo = gameRepo;
            _cloudinaryUploader = cloudinaryUploader;
        }

        public async Task<List<GamePackage>> GetAllPackagesAsync()
        {
            return await _packageRepo.GetAllAsync();
        }

        public async Task<List<GamePackage>> GetPackagesByGameIdAsync(long gameId)
        {
            return await _packageRepo.GetByGameIdAsync(gameId);
        }

        public async Task<GamePackage> GetPackageByIdOrThrowAsync(long id)
        {
            var package = await _packageRepo.GetByIdAsync(id);
            if (package == null)
            {
                throw new NotFoundException(ErrorCode.GamePackageNotFound);
            }
            return package;
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
            package.ImagePublicId = request.ImagePublicId;
            package.IsActive = request.IsActive;
            package.Id = await _packageRepo.CreateAsync(package);
            return package;
        }

        public async Task<GamePackage> CreatePackageWithImageAsync(
            CreateGamePackageRequest request,
            Stream imageStream,
            string fileName,
            string contentType,
            long fileLength)
        {
            ImageFileValidator.Validate(fileName, contentType, fileLength);
            await ValidateGameForPackageAsync(request.GameId);

            var upload = await _cloudinaryUploader.UploadImageAsync(imageStream, fileName, contentType);
            request.ImageUrl = upload.SecureUrl;
            request.ImagePublicId = upload.PublicId;

            var package = GamePackage.Create(
                request.Name,
                request.GameId,
                request.SalePrice,
                request.OriginalPrice,
                request.ImportPrice,
                request.StockQuantity);
            package.ImageUrl = request.ImageUrl;
            package.ImagePublicId = request.ImagePublicId;
            package.IsActive = request.IsActive;
            package.Id = await _packageRepo.CreateAsync(package);
            return package;
        }

        public async Task<GamePackage> UpdatePackageAsync(long id, UpdateGamePackageRequest request)
        {
            var package = await GetPackageByIdOrThrowAsync(id);
            request.Adapt(package);
            await _packageRepo.UpdateAsync(package);
            return package;
        }

        public async Task DeletePackageAsync(long id)
        {
            await GetPackageByIdOrThrowAsync(id);
            await _packageRepo.DeleteAsync(id);
        }

        public async Task IncreaseStockAsync(long id, int quantity)
        {
            ValidateStockQuantity(quantity);

            await _packageRepo.IncreaseStockAsync(id, quantity);
        }

        public async Task DecreaseStockAsync(long id, int quantity)
        {
            ValidateStockQuantity(quantity);

            var affectedRows = await _packageRepo.DecreaseStockAsync(id, quantity);
            if (affectedRows == 0) throw new BusinessException(ErrorCode.InsufficientStock);
        }

        public async Task<GamePackage> GetAvailablePackageAsync(long id, int quantity)
        {
            ValidateStockQuantity(quantity);

            var package = await GetPackageByIdOrThrowAsync(id);
            if (!package.IsActive) throw new BusinessException(ErrorCode.GamePackageInactive);
            if (package.StockQuantity < quantity) throw new BusinessException(ErrorCode.InsufficientStock);

            return package;
        }

        private async Task ValidateGameForPackageAsync(long gameId)
        {
            var game = await _gameRepo.GetByIdAsync(gameId);
            if (game == null)
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
            if (quantity <= 0) throw new BusinessException(ErrorCode.StockQuantityMustBePositive);
        }

    }
}

