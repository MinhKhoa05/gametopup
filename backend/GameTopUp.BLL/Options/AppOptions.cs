using System.ComponentModel.DataAnnotations;

namespace GameTopUp.BLL.Options;

public sealed class AppOptions
{
    [Required]
    public string BaseUrl { get; set; } = string.Empty;
}
