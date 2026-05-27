using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Utils;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using Mapster;

namespace GameTopUp.BLL.Services
{
    public class GamePackageService
    {
        private const long MaxImageBytes = 5 * 1024 * 1024;
        private static readonly HashSet<string> AllowedImageContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp"
        };

        private readonly IGamePackageRepository _packageRepo;
        private readonly IGameRepository _gameRepo;
        private readonly CloudinaryUploader _cloudinaryUploader;

        public GamePackageService(
            IGamePackageRepository packageRepo,
            IGameRepository gameRepo,
            CloudinaryUploader cloudinaryUploader)
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
                throw new NotFoundException("Gói nạp không tồn tại.");
            }
            return package;
        }

        public async Task<GamePackage> CreatePackageAsync(CreateGamePackageRequest request)
        {
            await ValidateGameForPackageAsync(request.GameId);

            var package = BuildPackage(request);
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
            ValidateImage(fileName, contentType, fileLength);
            await ValidateGameForPackageAsync(request.GameId);

            var upload = await _cloudinaryUploader.UploadImageAsync(imageStream, fileName, contentType);
            request.ImageUrl = upload.SecureUrl;
            request.ImagePublicId = upload.PublicId;

            var package = BuildPackage(request);
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
            if (affectedRows == 0) throw new BusinessException("Không đủ số lượng trong kho.");
        }

        public async Task<GamePackage> GetAvailablePackageAsync(long id, int quantity)
        {
            ValidateStockQuantity(quantity);

            var package = await GetPackageByIdOrThrowAsync(id);
            if (!package.IsActive) throw new BusinessException("Gói nạp hiện không khả dụng.");
            if (package.StockQuantity < quantity) throw new BusinessException("Số lượng trong kho không đủ.");

            return package;
        }

        private async Task ValidateGameForPackageAsync(long gameId)
        {
            var game = await _gameRepo.GetByIdAsync(gameId);
            if (game == null)
            {
                throw new NotFoundException("Game không tồn tại.");
            }

            if (!game.IsActive)
            {
                throw new BusinessException("Không thể thêm gói nạp vào Game đang ở trạng thái ngừng hoạt động.");
            }
        }

        private static GamePackage BuildPackage(CreateGamePackageRequest request)
        {
            return new GamePackage
            {
                Name = request.Name,
                NormalizedName = NormalizeName.Normalize(request.Name),
                ImageUrl = request.ImageUrl,
                ImagePublicId = request.ImagePublicId,
                GameId = request.GameId,
                SalePrice = request.SalePrice,
                OriginalPrice = request.OriginalPrice,
                ImportPrice = request.ImportPrice,
                StockQuantity = request.StockQuantity,
                IsActive = request.IsActive
            };
        }

        private static void ValidateStockQuantity(int quantity)
        {
            if (quantity <= 0) throw new BusinessException("Số lượng phải lớn hơn 0.");
        }

        private static void ValidateImage(string fileName, string contentType, long fileLength)
        {
            if (fileLength <= 0) throw new BusinessException("File ảnh không hợp lệ.");
            if (fileLength > MaxImageBytes) throw new BusinessException("Ảnh tải lên không được vượt quá 5MB.");
            if (!AllowedImageContentTypes.Contains(contentType))
                throw new BusinessException("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
            if (string.IsNullOrWhiteSpace(fileName))
                throw new BusinessException("Tên file ảnh không hợp lệ.");
        }
    }
}
