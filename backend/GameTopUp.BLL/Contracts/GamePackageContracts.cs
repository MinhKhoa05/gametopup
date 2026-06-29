using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace GameTopUp.BLL.Contracts;

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

public sealed class GamePackageResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string? Description { get; set; }

    public decimal SalePrice { get; set; }
    public decimal OriginalPrice { get; set; }

    public bool IsAvailable { get; set; }
}

public sealed class UpdateGamePackageRequest
{
    public string? Name { get; set; }
    public IFormFile? ImageFile { get; set; }

    public decimal? SalePrice { get; set; }
    public decimal? OriginalPrice { get; set; }
    public decimal? ImportPrice { get; set; }

    [Range(0, int.MaxValue)]
    public int? AvailableSlots { get; set; }

    public bool? IsActive { get; set; }
}
