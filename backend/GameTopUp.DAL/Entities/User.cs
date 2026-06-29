using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities;

[Table("users")]
public class User
{
    [Key]
    public long Id { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Member;

    public bool IsActive { get; set; } = true;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public static User Create(string displayName, string email, string passwordHash, UserRole role = UserRole.Member)
    {
        var now = DateTimeOffset.UtcNow;

        return new User
        {
            DisplayName = displayName,
            Email = email,
            PasswordHash = passwordHash,
            Role = role,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };
    }
}

public enum UserRole
{
    Member = 0,
    Admin = 1,
    Staff = 2
}
