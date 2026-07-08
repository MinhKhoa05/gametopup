using System.ComponentModel.DataAnnotations;

namespace GameTopUp.BLL.Options;

public sealed class EmailSettings
{
    [Required]
    public string Host { get; set; } = "smtp.gmail.com";

    [Range(1, 65535)]
    public int Port { get; set; } = 587;

    [EmailAddress]
    public string FromEmail { get; set; } = string.Empty;

    public string FromName { get; set; } = "GameTopUp";

    public string Username { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}
