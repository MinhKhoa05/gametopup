using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities.Orders;

[Table("order_history")]
public class OrderHistory
{
    [Key]
    public long Id { get; set; }

    public long OrderId { get; set; }
    public OrderStatus FromStatus { get; set; }
    public OrderStatus ToStatus { get; set; }
    public string? Note { get; set; }
    public long ActionBy { get; set; }
    public bool IsAdmin { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public static OrderHistory Create(
        long orderId,
        OrderStatus fromStatus,
        OrderStatus toStatus,
        long actionBy,
        string? note = null,
        bool isAdmin = false)
    {
        return new OrderHistory
        {
            OrderId = orderId,
            FromStatus = fromStatus,
            ToStatus = toStatus,
            Note = note,
            ActionBy = actionBy,
            IsAdmin = isAdmin,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }
}
