using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.BLL.DTOs.Orders;

public sealed class OrderTimelineEventResponseDTO
{
    public OrderStatus FromStatus { get; set; }
    public OrderStatus ToStatus { get; set; }
    public string? Note { get; set; }
    public long ActionBy { get; set; }
    public bool IsAdmin { get; set; }
    public DateTime CreatedAt { get; set; }
}
