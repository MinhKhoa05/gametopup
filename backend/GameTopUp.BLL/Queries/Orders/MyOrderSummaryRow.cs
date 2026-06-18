using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.BLL.Queries.Orders;

public sealed class MyOrderSummaryRow
{
    public long Id { get; set; }
    public string GameAccountInfo { get; set; } = string.Empty;
    public long GamePackageId { get; set; }
    public long? GameId { get; set; }
    public string? GameName { get; set; }
    public string? GameImageUrl { get; set; }
    public string? PackageName { get; set; }
    public string? PackageImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
