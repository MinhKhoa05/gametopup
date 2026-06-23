using GameTopUp.DAL.Entities.Users;

namespace GameTopUp.BLL.DTOs.Users;

public sealed class UserResponse
{
    public long Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
