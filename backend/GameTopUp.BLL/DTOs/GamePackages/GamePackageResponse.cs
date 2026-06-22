namespace GameTopUp.BLL.DTOs.GamePackages;

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
