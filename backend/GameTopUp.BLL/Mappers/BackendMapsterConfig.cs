using GameTopUp.BLL.Common;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Queries;
using Mapster;
using GameTopUp.BLL.Context;
using GameTopUp.DAL.Queries.Orders;

namespace GameTopUp.BLL.Mappers;

internal static class BackendMapsterConfig
{
    public static readonly TypeAdapterConfig Config = Create();

    private static TypeAdapterConfig Create()
    {
        var config = new TypeAdapterConfig();

        config.NewConfig<GameQueryRow, GameResponse>();
        config.NewConfig<Game, AdminGameResponse>();
        config.NewConfig<GameQueryRow, AdminGameResponse>();

        config.NewConfig<UpdateGameRequest, Game>()
            .IgnoreNullValues(true)
            .Map(dest => dest.Name, src => InputTextNormalizer.NullIfWhiteSpace(src.Name));

        config.NewConfig<UpdateGamePackageRequest, GamePackage>()
            .IgnoreNullValues(true)
            .Map(dest => dest.Name, src => InputTextNormalizer.NullIfWhiteSpace(src.Name));

        config.NewConfig<GamePackage, GamePackageResponse>()
            .Map(dest => dest.IsAvailable, src => src.AvailableSlots > 0);

        config.NewConfig<Order, OrderResponse>();
        config.NewConfig<OrderHistory, OrderHistoryResponse>();
        config.NewConfig<OrderQueryRow, OrderResponse>();
        config.NewConfig<OrderQueryRow, AdminOrderResponse>();

        config.NewConfig<WalletTransaction, WalletTransactionResponse>();

        config.NewConfig<WalletDeposit, WalletDepositResponse>();
        config.NewConfig<WalletDeposit, AdminDepositResponse>();

        config.NewConfig<User, UserResponse>();
        config.NewConfig<User, UserContext>()
            .Map(dest => dest.UserId, src => src.Id);
        return config;
    }
}
