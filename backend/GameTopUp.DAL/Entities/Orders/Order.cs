using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities.Orders;

[Table("orders")]
public class Order
{
    [Key]
    public long Id { get; set; }

    public long UserId { get; set; }
    public string GameAccountInfo { get; set; } = string.Empty;
    public long GamePackageId { get; set; }
    public decimal PackagePrice { get; set; }
    public long? AssignedTo { get; set; }
    public DateTime? AssignedAt { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public static Order Create(
        long userId,
        long gamePackageId,
        decimal packagePrice,
        string gameAccountInfo,
        OrderStatus status = OrderStatus.Pending)
    {
        var now = DateTime.UtcNow;

        return new Order
        {
            UserId = userId,
            GamePackageId = gamePackageId,
            PackagePrice = packagePrice,
            GameAccountInfo = gameAccountInfo,
            Status = status,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void UpdateStatus(OrderStatus newStatus, long? assignedTo = null)
    {
        var now = DateTime.UtcNow;

        Status = newStatus;
        UpdatedAt = now;

        if (assignedTo.HasValue)
        {
            AssignedTo = assignedTo;
            AssignedAt = now;
        }
    }

    public void MarkProcessing(long adminUserId)
    {
        UpdateStatus(OrderStatus.Processing, adminUserId);
    }

    public void MarkCompleted()
    {
        UpdateStatus(OrderStatus.Completed);
    }

    public void MarkCancelled()
    {
        UpdateStatus(OrderStatus.Cancelled);
    }
}
