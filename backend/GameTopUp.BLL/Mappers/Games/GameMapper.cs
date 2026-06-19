using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Mappers;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.BLL.Queries.Games;
using Mapster;

namespace GameTopUp.BLL.Mappers.Games;

public static class GameMapper
{
    public static PublicGameResponse ToPublicResponse(Game game)
    {
        return game.Adapt<PublicGameResponse>(BackendMapsterConfig.Config);
    }

    public static PublicGamePackageResponse ToPublicResponse(GamePackage package)
    {
        return package.Adapt<PublicGamePackageResponse>(BackendMapsterConfig.Config);
    }

    public static AdminGameSummaryResponse ToAdminSummaryResponse(AdminGameSummaryRow row)
    {
        return row.Adapt<AdminGameSummaryResponse>(BackendMapsterConfig.Config);
    }
}
