using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities.Games;

[Table("games")]
public class Game
{
    [Key]
    public long Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; } = string.Empty;
    public string? ImageRelativePath { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public static Game Create(string name, string imageUrl = "", string? imageRelativePath = null)
    {
        var now = DateTime.UtcNow;

        return new Game
        {
            Name = name.Trim(),
            ImageUrl = imageUrl,
            ImageRelativePath = imageRelativePath,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void ApplyImage(string? imageUrl, string? imageRelativePath)
    {
        ImageUrl = imageUrl;
        ImageRelativePath = imageRelativePath;
    }
}
