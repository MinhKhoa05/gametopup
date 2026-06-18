using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace GameTopUp.BLL.DTOs.GamePackages;

public sealed class CreateGamePackageRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public IFormFile? ImageFile { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? ImageRelativePath { get; set; }

    [Required]
    public long GameId { get; set; }

    [Range(0, double.MaxValue)]
    public decimal SalePrice { get; set; }

    [Range(0, double.MaxValue)]
    public decimal OriginalPrice { get; set; }

    [Range(0, double.MaxValue)]
    public decimal ImportPrice { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    public bool IsActive { get; set; } = true;
}
