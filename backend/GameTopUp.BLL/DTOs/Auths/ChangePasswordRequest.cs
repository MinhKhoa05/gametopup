using System.ComponentModel.DataAnnotations;

namespace GameTopUp.BLL.DTOs.Auths;

public sealed class ChangePasswordRequest
{
    [Required]
    [MinLength(8)]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}
