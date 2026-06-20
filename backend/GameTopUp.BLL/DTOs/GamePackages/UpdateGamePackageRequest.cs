using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace GameTopUp.BLL.DTOs.GamePackages;

public sealed class UpdateGamePackageRequest
{
    public string? Name { get; set; }
    public IFormFile? ImageFile { get; set; }
    public string? ImageUrl { get; set; }
    public string? ImageRelativePath { get; set; }
    public decimal? SalePrice { get; set; }
    public decimal? OriginalPrice { get; set; }
    public decimal? ImportPrice { get; set; }

    [Range(0, int.MaxValue)]
    public int? AvailableSlots { get; set; }
    public bool? IsActive { get; set; }
}
