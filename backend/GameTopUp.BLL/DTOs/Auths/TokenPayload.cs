using GameTopUp.BLL.Context;
using GameTopUp.DAL.Entities.Users;

namespace GameTopUp.BLL.DTOs.Auths;

public sealed class TokenPayload
{
    public long UserId { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public UserRole Role { get; init; }

    public static TokenPayload Create(UserContext userContext)
    {
        return new TokenPayload
        {
            UserId = userContext.UserId,
            DisplayName = userContext.DisplayName,
            Email = userContext.Email,
            Role = userContext.Role
        };
    }
}
