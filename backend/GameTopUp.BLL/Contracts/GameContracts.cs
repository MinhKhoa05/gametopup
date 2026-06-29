using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace GameTopUp.BLL.Contracts;

public sealed class CreateGameRequest
{
    [Required]
    [MinLength(1)]
    public string Name { get; set; } = string.Empty;

    public IFormFile? ImageFile { get; set; }

    public bool IsActive { get; set; } = true;
}

public sealed class GameResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;

    public int ActivePackages { get; set; }
}

public sealed class UpdateGameRequest
{
    public string? Name { get; set; }
    public IFormFile? ImageFile { get; set; }
    public bool? IsActive { get; set; }
}

public sealed class AdminGameResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public int ActivePackages { get; set; }
    public int InactivePackages { get; set; }
    public int TotalPackages { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
