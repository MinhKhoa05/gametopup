using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities;

[Table("wallets")]
public class Wallet
{
    [Key]
    public long Id { get; set; }

    public long UserId { get; set; }

    public decimal Balance { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public static Wallet CreateForUser(long userId, decimal initialBalance = 0)
    {
        var now = DateTimeOffset.UtcNow;

        return new Wallet
        {
            UserId = userId,
            Balance = initialBalance,
            CreatedAt = now,
            UpdatedAt = now
        };
    }
}
