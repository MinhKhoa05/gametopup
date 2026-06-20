using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities.Games;

[Table("game_packages")]
public class GamePackage
{
    [Key]
    public long Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; } = string.Empty;
    public string? ImageRelativePath { get; set; } = string.Empty;
    public long GameId { get; set; }
    public decimal SalePrice { get; set; }
    public decimal OriginalPrice { get; set; }
    public decimal ImportPrice { get; set; }
    public int AvailableSlots { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public static GamePackage Create(
        string name,
        long gameId,
        decimal salePrice,
        decimal originalPrice,
        decimal importPrice,
        int availableSlots = 0)
    {
        var now = DateTime.UtcNow;

        return new GamePackage
        {
            Name = name.Trim(),
            GameId = gameId,
            SalePrice = salePrice,
            OriginalPrice = originalPrice,
            ImportPrice = importPrice,
            AvailableSlots = availableSlots,
            ImageUrl = string.Empty,
            ImageRelativePath = null,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };
    }
}
