using System.ComponentModel.DataAnnotations;
using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.Contracts;

public sealed class PurchaseOrderRequest
{
    [Required]
    public long PackageId { get; set; }

    [Required]
    public string GameAccountInfo { get; set; } = string.Empty;
}

public sealed class CreateOrderResponse
{
    public long OrderId { get; set; }
}

public enum OrderFilter
{
    Watching,
    Pending,
    Processing,
    Completed,
    Cancelled
}

public sealed class OrderResponse
{
    public long Id { get; set; }
    public string GameAccountInfo { get; set; } = string.Empty;

    public long PackageId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public string PackageName { get; set; } = string.Empty;
    public decimal PackagePrice { get; set; }
    public string PackageImageUrl { get; set; } = string.Empty;

    public OrderStatus Status { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class AdminOrderResponse
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string GameAccountInfo { get; set; } = string.Empty;

    public long PackageId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public string PackageName { get; set; } = string.Empty;
    public decimal PackagePrice { get; set; }
    public decimal PackageCost { get; set; }
    public string PackageImageUrl { get; set; } = string.Empty;

    public long? AssignedTo { get; set; }
    public DateTimeOffset? AssignedAt { get; set; }

    public OrderStatus Status { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class OrderHistoryResponse
{
    public long Id { get; set; }
    public long OrderId { get; set; }

    public OrderStatus FromStatus { get; set; }
    public OrderStatus ToStatus { get; set; }
    public string? Note { get; set; }

    public long ActionBy { get; set; }
    public bool IsAdmin { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
