using System.ComponentModel.DataAnnotations;

namespace GameTopUp.BLL.Options;

public sealed class JwtSettings
{
    [Required]
    public string Key { get; set; } = string.Empty;

    [Required]
    public string Issuer { get; set; } = string.Empty;

    [Required]
    public string Audience { get; set; } = string.Empty;

    public int ExpireMinutes { get; set; } = 30;
}
