using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.BLL.DTOs.Orders;

public sealed class OrderActionResponseDTO
{
    public long OrderId { get; set; }
    public OrderStatus? FromStatus { get; set; }
    public OrderStatus ToStatus { get; set; }
    public bool Changed { get; set; }
    public long? AssignTo { get; set; }
    public DateTime? AssignAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
