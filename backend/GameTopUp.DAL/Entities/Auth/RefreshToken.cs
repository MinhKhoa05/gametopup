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

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? RevokedAt { get; set; }

    public static RefreshToken Create(long userId, string tokenHash, TimeSpan lifetime)
    {
        var now = DateTimeOffset.UtcNow;

        return new RefreshToken
        {
            UserId = userId,
            TokenHash = tokenHash,
            CreatedAt = now,
            ExpiresAt = now.Add(lifetime)
        };
    }
}
