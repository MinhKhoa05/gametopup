using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.BLL.DTOs.Orders;

public sealed class AdminOrderSummaryResponseDTO
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string GameAccountInfo { get; set; } = string.Empty;
    public long GamePackageId { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
    public long? AssignedTo { get; set; }
    public DateTime? AssignedAt { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
