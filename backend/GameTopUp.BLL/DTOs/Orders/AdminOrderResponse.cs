using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.BLL.DTOs.Orders;

public sealed class AdminOrderResponse
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string GameAccountInfo { get; set; } = string.Empty;
    public long GamePackageId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public string PackageName { get; set; } = string.Empty;
    public decimal PackagePrice { get; set; }
    public decimal PackageCost { get; set; }
    public string PackageImageUrl { get; set; } = string.Empty; 
    public long? AssignedTo { get; set; }
    public DateTime? AssignedAt { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
