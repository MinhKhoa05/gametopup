using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Entities.Wallets;
using Mapster;

namespace GameTopUp.BLL.Mappers;

internal static class BackendMapsterConfig
{
    public static readonly TypeAdapterConfig Config = Create();

    private static TypeAdapterConfig Create()
    {
        var config = new TypeAdapterConfig();

        config.NewConfig<Game, PublicGameResponse>();

        config.NewConfig<GamePackage, PublicGamePackageResponse>()
            .Map(dest => dest.IsAvailable, src => src.StockQuantity > 0);

        config.NewConfig<WalletTransaction, WalletTransactionInfo>();

        config.NewConfig<WalletDeposit, WalletDepositResponseDTO>();
        config.NewConfig<WalletDeposit, AdminDepositRequestResponseDTO>();

        config.NewConfig<User, UserResponseDTO>()
            .Map(dest => dest.Role, src => src.Role.ToString());

        return config;
    }
}
