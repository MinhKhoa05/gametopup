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
}

public enum OrderStatus
{
    Pending = 1,
    Processing = 2,
    Completed = 3,
    Cancelled = 4
}
