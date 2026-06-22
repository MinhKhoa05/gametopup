using System.ComponentModel.DataAnnotations;

namespace GameTopUp.BLL.DTOs.Orders;

public sealed class PurchaseOrderRequest
{
    [Required]
    public long GamePackageId { get; set; }

    [Required]
    public string GameAccountInfo { get; set; } = string.Empty;
}
