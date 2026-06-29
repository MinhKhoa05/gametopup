using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.Context;

public sealed class UserContext
{
    public long UserId { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public UserRole Role { get; init; } = UserRole.Member;
    public bool IsAdmin => Role == UserRole.Admin;
}
