using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities.Wallets;

[Table("wallet_transactions")]
public class WalletTransaction
{
    [Key]
    public long Id { get; set; }

    public long UserId { get; set; }

    public decimal Amount { get; set; }

    public decimal BalanceBefore { get; set; }

    public decimal BalanceAfter { get; set; }

    public WalletTransactionType Type { get; set; }

    public string? ReferenceId { get; set; }

    public DateTime CreatedAt { get; set; }

    public static WalletTransaction Create(
        long userId,
        decimal amount,
        decimal balanceBefore,
        decimal balanceAfter,
        WalletTransactionType type,
        string? referenceId = null)
    {
        return new WalletTransaction
        {
            UserId = userId,
            Amount = amount,
            BalanceBefore = balanceBefore,
            BalanceAfter = balanceAfter,
            Type = type,
            ReferenceId = referenceId,
            CreatedAt = DateTime.UtcNow
        };
    }
}
