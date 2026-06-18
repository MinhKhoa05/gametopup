using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.BLL.Queries.Games;

namespace GameTopUp.BLL.Mappers.Games;

public static class GameMapper
{
    public static PublicGameResponse ToPublicResponse(Game game)
    {
        return new PublicGameResponse
        {
            Id = game.Id,
            Name = game.Name,
            ImageUrl = game.ImageUrl,
        };
    }

    public static PublicGamePackageResponse ToPublicResponse(GamePackage package)
    {
        return new PublicGamePackageResponse
        {
            Id = package.Id,
            Name = package.Name,
            ImageUrl = package.ImageUrl,
            Description = null,
            SalePrice = package.SalePrice,
            OriginalPrice = package.OriginalPrice,
            IsAvailable = package.StockQuantity > 0,
            StockStatus = package.StockQuantity > 0 ? "in_stock" : "out_of_stock",
        };
    }

    public static AdminGameSummaryResponse ToAdminSummaryResponse(AdminGameSummaryRow row)
    {
        return new AdminGameSummaryResponse
        {
            Id = row.Id,
            Name = row.Name,
            ImageUrl = row.ImageUrl,
            IsActive = row.IsActive,
            PackageCount = row.PackageCount,
            CreatedAt = row.CreatedAt,
            UpdatedAt = row.UpdatedAt,
        };
    }
}
