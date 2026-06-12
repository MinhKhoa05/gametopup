using GameTopUp.DAL.Entities.Users;

namespace GameTopUp.BLL.DTOs.Users;

public sealed class UpdateUserRequest
{
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
    public UserRole? Role { get; set; }
    public bool? IsActive { get; set; }
}
