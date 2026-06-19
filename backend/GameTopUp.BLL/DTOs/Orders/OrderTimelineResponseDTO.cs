using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.BLL.DTOs.Orders;

public sealed class OrderTimelineResponseDTO
{
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? AssignedAt { get; set; }
    public List<OrderTimelineEventResponseDTO> Events { get; set; } = [];
}
