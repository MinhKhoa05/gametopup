using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities.Auth;

[Table("refresh_tokens")]
public class RefreshToken
{
    [Key]
    public long Id { get; set; }

    public long UserId { get; set; }

    public string TokenHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    public static RefreshToken Create(long userId, string tokenHash, TimeSpan lifetime)
    {
        var now = DateTime.UtcNow;

        return new RefreshToken
        {
            UserId = userId,
            TokenHash = tokenHash,
            CreatedAt = now,
            ExpiresAt = now.Add(lifetime)
        };
    }
}
