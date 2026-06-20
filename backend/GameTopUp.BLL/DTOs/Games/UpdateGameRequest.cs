using Microsoft.AspNetCore.Http;

namespace GameTopUp.BLL.DTOs.Games;

public sealed class UpdateGameRequest
{
    public string? Name { get; set; }
    public IFormFile? ImageFile { get; set; }
    public bool? IsActive { get; set; }
}
