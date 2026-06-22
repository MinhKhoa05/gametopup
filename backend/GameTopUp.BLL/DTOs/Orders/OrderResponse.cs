using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.BLL.DTOs.Orders;

public sealed class OrderResponse
{
    public long Id { get; set; }
    public string GameAccountInfo { get; set; } = string.Empty;
    public long GamePackageId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public string PackageName { get; set; } = string.Empty;
    public decimal PackagePrice { get; set; }
    public string PackageImageUrl { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
