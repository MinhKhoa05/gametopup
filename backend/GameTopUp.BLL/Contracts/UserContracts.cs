using System.ComponentModel.DataAnnotations;
using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.Contracts;

public sealed class CreateUserRequest
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string DisplayName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;
}

public sealed class UpdateProfileRequest
{
    public string? DisplayName { get; set; }
}

public sealed class UserResponse
{
    public long Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public UserRole Role { get; set; }
    public bool IsActive { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
