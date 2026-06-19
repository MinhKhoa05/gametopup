using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.DTOs.Wallets;
using GameTopUp.BLL.Queries.Games;
using GameTopUp.BLL.Queries.Orders;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Orders;
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

        config.NewConfig<AdminGameSummaryRow, AdminGameSummaryResponse>();

        config.NewConfig<MyOrderSummaryRow, MyOrderSummaryResponseDTO>()
            .Map(dest => dest.Total, src => src.UnitPrice);

        config.NewConfig<AdminOrderSummaryRow, AdminOrderSummaryResponseDTO>();

        config.NewConfig<WalletTransaction, WalletTransactionInfo>();

        config.NewConfig<WalletDepositRequest, WalletDepositRequestResponseDTO>();
        config.NewConfig<WalletDepositRequest, AdminDepositRequestResponseDTO>();

        config.NewConfig<User, UserResponseDTO>()
            .Map(dest => dest.Role, src => src.Role.ToString());

        config.NewConfig<OrderChangeResult, OrderActionResponseDTO>()
            .Map(dest => dest.OrderId, src => src.Order.Id)
            .Map(dest => dest.FromStatus, src => src.FromStatus)
            .Map(dest => dest.ToStatus, src => src.Order.Status)
            .Map(dest => dest.Changed, src => src.Changed)
            .Map(dest => dest.AssignTo, src => src.Order.AssignedTo)
            .Map(dest => dest.AssignAt, src => src.Order.AssignedAt)
            .Map(dest => dest.UpdatedAt, src => src.Order.UpdatedAt);

        return config;
    }
}
