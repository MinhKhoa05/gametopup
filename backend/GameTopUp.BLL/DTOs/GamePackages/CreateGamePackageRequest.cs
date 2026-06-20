using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace GameTopUp.BLL.DTOs.GamePackages;

public sealed class CreateGamePackageRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public IFormFile? ImageFile { get; set; }

    [Range(0, double.MaxValue)]
    public decimal SalePrice { get; set; }

    [Range(0, double.MaxValue)]
    public decimal OriginalPrice { get; set; }

    [Range(0, double.MaxValue)]
    public decimal ImportPrice { get; set; }

    [Range(0, int.MaxValue)]
    public int AvailableSlots { get; set; }

    public bool IsActive { get; set; } = true;
}
