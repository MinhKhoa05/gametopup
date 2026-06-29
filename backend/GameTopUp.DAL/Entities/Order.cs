using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities;

[Table("orders")]
public class Order
{
    [Key]
    public long Id { get; set; }

    public long UserId { get; set; }
    public string GameAccountInfo { get; set; } = string.Empty;
    public long GamePackageId { get; set; }
    public string PackageName { get; set; } = string.Empty;
    public decimal PackagePrice { get; set; }
    public decimal PackageCost { get; set; }
    public long? AssignedTo { get; set; }
    public DateTimeOffset? AssignedAt { get; set; }
    public OrderStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public static Order Create(
        long userId,
        long gamePackageId,
        decimal packagePrice,
        string packageName,
        string gameAccountInfo,
        OrderStatus status = OrderStatus.Pending)
    {
        var now = DateTimeOffset.UtcNow;

        return new Order
        {
            UserId = userId,
            GamePackageId = gamePackageId,
            PackagePrice = packagePrice,
            PackageName = packageName.Trim(),
            PackageCost = 0m,
            GameAccountInfo = gameAccountInfo,
            Status = status,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void UpdateStatus(OrderStatus newStatus, long? assignedTo = null)
    {
        var now = DateTimeOffset.UtcNow;

        Status = newStatus;
        UpdatedAt = now;

        if (assignedTo.HasValue)
        {
            AssignedTo = assignedTo;
            AssignedAt = now;
        }
    }

    public void MarkProcessing(long adminUserId, decimal packageCost)
    {
        UpdateStatus(OrderStatus.Processing, adminUserId);
        PackageCost = packageCost;
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

public enum OrderStatus
{
    Pending = 1,
    Processing = 2,
    Completed = 3,
    Cancelled = 4
}
