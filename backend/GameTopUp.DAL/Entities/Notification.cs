using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities;

[Table("notifications")]
public class Notification
{
    [Key]
    public long Id { get; set; }

    public long UserId { get; set; }

    public NotificationType Type { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; }

    public DateTimeOffset? ReadAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}

public enum NotificationType
{
    OrderPlaced = 1,
    OrderProcessing = 2,
    OrderCompleted = 3,
    OrderCancelled = 4,
    DepositSubmitted = 5,
    DepositApproved = 6,
    DepositRejected = 7,
    Welcome = 8,
    System = 9
}
