using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Services.Images;
using GameTopUp.BLL.Utilities;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
namespace GameTopUp.BLL.Services.Games;

public sealed class PackageService
{
    private const string PackageImageFolder = "packages";

    private readonly IPackageRepository _packageRepository;
    private readonly IGameRepository _gameRepository;
    private readonly IImageStorageService _imageStorageService;
    private readonly PublicImageUrlBuilder _imageUrlBuilder;

    public PackageService(
        IPackageRepository packageRepository,
        IGameRepository gameRepository,
        IImageStorageService imageStorageService,
        PublicImageUrlBuilder imageUrlBuilder)
    {
        _packageRepository = packageRepository;
        _gameRepository = gameRepository;
        _imageStorageService = imageStorageService;
        _imageUrlBuilder = imageUrlBuilder;
    }

    public async Task<List<AdminPackageResponse>> GetAdminPackagesByGameIdAsync(long gameId)
    {
        var packages = await _packageRepository.GetByGameIdAsync(gameId);

        return packages
            .Select(item => WithPublicImageUrl(item.MapTo<AdminPackageResponse>()))
            .ToList();
    }

    public async Task<List<PackageResponse>> GetActicePackagesByGameIdAsync(long gameId)
    {
        var packages = await _packageRepository.GetActiveByGameIdAsync(gameId);

        return packages
            .Select(item => WithPublicImageUrl(item.MapTo<PackageResponse>()))
            .ToList();
    }

    public async Task<Package> GetPackageByIdOrThrowAsync(long id)
    {
        return await _packageRepository.GetByIdAsync(id)
                    ?? throw new NotFoundException(ErrorCode.PackageNotFound);
    }

    public async Task<Package> GetActivePackageByIdOrThrowAsync(long id)
    {
        var package = await GetPackageByIdOrThrowAsync(id);

        if (!package.IsActive)
        {
            throw new BusinessException(ErrorCode.PackageInactive);
        }

        return package;
    }

    public async Task<PackageResponse> GetPackageByIdAsync(long id)
    {
        var package = await GetActivePackageByIdOrThrowAsync(id);
        return WithPublicImageUrl(package.MapTo<PackageResponse>());
    }

    public async Task ReservePackageAsync(long packageId)
    {
        var affectedRows = await _packageRepository.DecreaseStockAsync(packageId, 1);

        if (affectedRows == 0)
        {
            throw new BusinessException(ErrorCode.PackageOutOfStock);
        }
    }

    public async Task RestorePackageAsync(long packageId)
    {
        var affectedRows = await _packageRepository.IncreaseStockAsync(packageId, 1);

        if (affectedRows == 0)
        {
            throw new NotFoundException(ErrorCode.PackageNotFound);
        }
    }

    public async Task<Package> CreatePackageAsync(long gameId, CreatePackageRequest request)
    {
        await EnsureGameExistsAsync(gameId);

        var packageName = InputTextNormalizer.Required(request.Name, ErrorCode.BadRequest);

        var uploadedImage = await _imageStorageService.UploadAsync(request.ImageFile, PackageImageFolder);

        try
        {
            var now = DateTimeOffset.UtcNow;
            var package = request.MapTo<Package>();
            package.Name = packageName;
            package.GameId = gameId;
            package.CreatedAt = now;
            package.UpdatedAt = now;
            package.ImageUrl = string.Empty;
            package.ImageRelativePath = null;

            if (uploadedImage is not null)
            {
                package.ImageUrl = uploadedImage.Url;
                package.ImageRelativePath = uploadedImage.RelativePath;
            }

            package.Id = await _packageRepository.CreateAsync(package);
            return package;
        }
        catch
        {
            await _imageStorageService.DeleteAsync(uploadedImage?.RelativePath);
            throw;
        }
    }

    public async Task<AdminPackageResponse> CreateAdminPackageAsync(long gameId, CreatePackageRequest request)
    {
        var package = await CreatePackageAsync(gameId, request);
        return WithPublicImageUrl(package.MapTo<AdminPackageResponse>());
    }

    public async Task<Package> UpdatePackageAsync(long id, UpdatePackageRequest request)
    {
        var package = await GetPackageByIdOrThrowAsync(id);
        var previousImagePath = package.ImageRelativePath;

        var uploadedImage = await _imageStorageService.UploadAsync(request.ImageFile, PackageImageFolder);

        try
        {
            request.ApplyTo(package);
            if (uploadedImage is not null)
            {
                package.ImageUrl = uploadedImage.Url;
                package.ImageRelativePath = uploadedImage.RelativePath;
            }

            package.UpdatedAt = DateTimeOffset.UtcNow;

            await _packageRepository.UpdateAsync(package);

            if (uploadedImage is not null)
            {
                await _imageStorageService.DeleteAsync(previousImagePath);
            }

            return package;
        }
        catch
        {
            await _imageStorageService.DeleteAsync(uploadedImage?.RelativePath);
            throw;
        }
    }

    public async Task<AdminPackageResponse> UpdateAdminPackageAsync(long id, UpdatePackageRequest request)
    {
        var package = await UpdatePackageAsync(id, request);
        return WithPublicImageUrl(package.MapTo<AdminPackageResponse>());
    }

    public async Task DeletePackageAsync(long id)
    {
        var package = await GetPackageByIdOrThrowAsync(id);

        await _packageRepository.DeleteAsync(id);
        await _imageStorageService.DeleteAsync(package.ImageRelativePath);
    }

    private async Task EnsureGameExistsAsync(long gameId)
    {
        if (await _gameRepository.GetByIdAsync(gameId) is null)
        {
            throw new NotFoundException(ErrorCode.GameNotFound);
        }
    }

    private PackageResponse WithPublicImageUrl(PackageResponse package)
    {
        package.ImageUrl = _imageUrlBuilder.Build(package.ImageUrl);
        return package;
    }

    private AdminPackageResponse WithPublicImageUrl(AdminPackageResponse package)
    {
        package.ImageUrl = _imageUrlBuilder.Build(package.ImageUrl);
        return package;
    }
}
