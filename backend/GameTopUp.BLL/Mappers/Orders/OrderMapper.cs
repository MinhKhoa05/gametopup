using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Queries.Orders;

namespace GameTopUp.BLL.Mappers.Orders;

public static class OrderMapper
{
    public static MyOrderSummaryResponseDTO ToMyOrderSummaryResponse(MyOrderSummaryRow row)
    {
        return new MyOrderSummaryResponseDTO
        {
            Id = row.Id,
            GameAccountInfo = row.GameAccountInfo,
            GamePackageId = row.GamePackageId,
            GameId = row.GameId,
            GameName = row.GameName,
            GameImageUrl = row.GameImageUrl,
            PackageName = row.PackageName,
            PackageImageUrl = row.PackageImageUrl,
            UnitPrice = row.UnitPrice,
            Total = row.UnitPrice,
            Status = row.Status,
            CreatedAt = row.CreatedAt,
            UpdatedAt = row.UpdatedAt,
        };
    }

    public static AdminOrderSummaryResponseDTO ToAdminOrderSummaryResponse(AdminOrderSummaryRow row)
    {
        return new AdminOrderSummaryResponseDTO
        {
            Id = row.Id,
            UserId = row.UserId,
            GameAccountInfo = row.GameAccountInfo,
            GamePackageId = row.GamePackageId,
            UnitPrice = row.UnitPrice,
            Total = row.Total,
            AssignedTo = row.AssignedTo,
            AssignedAt = row.AssignedAt,
            Status = row.Status,
            CreatedAt = row.CreatedAt,
            UpdatedAt = row.UpdatedAt,
        };
    }
}
