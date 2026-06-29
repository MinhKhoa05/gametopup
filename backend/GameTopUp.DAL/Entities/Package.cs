using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities;

[Table("packages")]
public class Package
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
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
