using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities;

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

    public DateTimeOffset? UserConfirmedAt { get; set; }

    public long? ReviewedBy { get; set; }

    public DateTimeOffset? ReviewedAt { get; set; }

    public string? AdminNote { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public void MarkUserConfirmed()
    {
        var now = DateTimeOffset.UtcNow;

        Status = WalletDepositStatus.UserConfirmed;
        UserConfirmedAt = now;
        UpdatedAt = now;
    }

    public void MarkApproved(long reviewedBy, string? note)
    {
        var now = DateTimeOffset.UtcNow;

        Status = WalletDepositStatus.Approved;
        ReviewedBy = reviewedBy;
        ReviewedAt = now;
        AdminNote = note;
        UpdatedAt = now;
    }

    public void MarkRejected(long reviewedBy, string? note)
    {
        var now = DateTimeOffset.UtcNow;

        Status = WalletDepositStatus.Rejected;
        ReviewedBy = reviewedBy;
        ReviewedAt = now;
        AdminNote = note;
        UpdatedAt = now;
    }
}

public enum WalletDepositStatus
{
    Pending = 1,
    UserConfirmed = 2,
    Approved = 3,
    Rejected = 4
}
