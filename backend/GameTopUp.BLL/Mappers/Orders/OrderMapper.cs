using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Queries.Orders;
using Mapster;

namespace GameTopUp.BLL.Mappers.Orders;

public static class OrderMapper
{
    public static MyOrderSummaryResponseDTO ToMyOrderSummaryResponse(MyOrderSummaryRow row)
    {
        return row.Adapt<MyOrderSummaryResponseDTO>(BackendMapsterConfig.Config);
    }

    public static AdminOrderSummaryResponseDTO ToAdminOrderSummaryResponse(AdminOrderSummaryRow row)
    {
        return row.Adapt<AdminOrderSummaryResponseDTO>(BackendMapsterConfig.Config);
    }

    public static OrderActionResponseDTO ToActionResponse(OrderChangeResult result)
    {
        return result.Adapt<OrderActionResponseDTO>(BackendMapsterConfig.Config);
    }
}
