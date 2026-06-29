using GameTopUp.BLL.Utilities;
using GameTopUp.BLL.Contracts;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Queries;
using Mapster;
using GameTopUp.BLL.Context;

namespace GameTopUp.BLL.Mappers;

internal static class BackendMapsterConfig
{
    public static readonly TypeAdapterConfig Config = Create();

    private static TypeAdapterConfig Create()
    {
        var config = new TypeAdapterConfig();

        config.NewConfig<CreateUserRequest, User>();
        config.NewConfig<CreateGameRequest, Game>();
        config.NewConfig<CreateGamePackageRequest, GamePackage>();

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


        config.NewConfig<User, UserResponse>();
        config.NewConfig<User, TokenPayload>()
            .Map(dest => dest.UserId, src => src.Id);
        config.NewConfig<User, UserContext>()
            .Map(dest => dest.UserId, src => src.Id);
        return config;
    }
}
