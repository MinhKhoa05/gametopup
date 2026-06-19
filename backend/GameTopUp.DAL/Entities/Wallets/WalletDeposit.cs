using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities.Wallets;

[Table("wallet_deposits")]
public class WalletDeposit
{
    [Key]
    public long Id { get; set; }

    public long UserId { get; set; }

    public decimal Amount { get; set; }

    public string Code { get; set; } = string.Empty;

    public string TransferContent { get; set; } = string.Empty;

    public WalletDepositStatus Status { get; set; } = WalletDepositStatus.Pending;

    public DateTime? UserConfirmedAt { get; set; }

    public long? ReviewedBy { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public string? AdminNote { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public static WalletDeposit Create(
        long userId,
        decimal amount,
        string code,
        string transferContent)
    {
        var now = DateTime.UtcNow;

        return new WalletDeposit
        {
            UserId = userId,
            Amount = amount,
            Code = code,
            TransferContent = transferContent,
            Status = WalletDepositStatus.Pending,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void MarkUserConfirmed(DateTime now)
    {
        Status = WalletDepositStatus.UserConfirmed;
        UserConfirmedAt = now;
        UpdatedAt = now;
    }

    public void MarkApproved(long reviewedBy, string? note, DateTime now)
    {
        Status = WalletDepositStatus.Approved;
        ReviewedBy = reviewedBy;
        ReviewedAt = now;
        AdminNote = note;
        UpdatedAt = now;
    }

    public void MarkRejected(long reviewedBy, string? note, DateTime now)
    {
        Status = WalletDepositStatus.Rejected;
        ReviewedBy = reviewedBy;
        ReviewedAt = now;
        AdminNote = note;
        UpdatedAt = now;
    }
}
