using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.Contracts;

public sealed class ChangePasswordRequest
{
    [Required]
    [MinLength(8)]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}

public sealed class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;
}

public sealed class AuthResponse
{
    [JsonIgnore]
    public string AccessToken { get; set; } = string.Empty;

    [JsonIgnore]
    public string RefreshToken { get; set; } = string.Empty;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public UserResponse? User { get; set; }
}

public sealed class TokenPayload
{
    public long UserId { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public UserRole Role { get; init; }
}
