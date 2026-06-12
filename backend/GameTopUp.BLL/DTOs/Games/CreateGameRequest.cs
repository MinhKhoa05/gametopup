using System.ComponentModel.DataAnnotations;

namespace GameTopUp.BLL.DTOs.Games;

public sealed class CreateGameRequest
{
    [Required]
    [MinLength(1)]
    public string Name { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;
    public string? ImageRelativePath { get; set; }

    public bool IsActive { get; set; } = true;
}
