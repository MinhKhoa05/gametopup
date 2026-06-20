using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace GameTopUp.BLL.DTOs.Games;

public sealed class CreateGameRequest
{
    [Required]
    [MinLength(1)]
    public string Name { get; set; } = string.Empty;

    public IFormFile? ImageFile { get; set; }

    public bool IsActive { get; set; } = true;
}
