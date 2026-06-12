using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities.Wallets;

[Table("wallet_deposit_requests")]
public class WalletDepositRequest
{
    [Key]
    public long Id { get; set; }

    public long UserId { get; set; }

    public decimal Amount { get; set; }

    public string Code { get; set; } = string.Empty;

    public string TransferContent { get; set; } = string.Empty;

    public string QrImageUrl { get; set; } = string.Empty;

    public WalletDepositRequestStatus Status { get; set; } = WalletDepositRequestStatus.Pending;

    public DateTime? UserConfirmedAt { get; set; }

    public long? ReviewedBy { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public string? AdminNote { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public static WalletDepositRequest Create(
        long userId,
        decimal amount,
        string code,
        string transferContent,
        string qrImageUrl)
    {
        var now = DateTime.UtcNow;

        return new WalletDepositRequest
        {
            UserId = userId,
            Amount = amount,
            Code = code,
            TransferContent = transferContent,
            QrImageUrl = qrImageUrl,
            Status = WalletDepositRequestStatus.Pending,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void MarkUserConfirmed(DateTime now)
    {
        Status = WalletDepositRequestStatus.UserConfirmed;
        UserConfirmedAt = now;
        UpdatedAt = now;
    }

    public void MarkApproved(long reviewedBy, string? note, DateTime now)
    {
        Status = WalletDepositRequestStatus.Approved;
        ReviewedBy = reviewedBy;
        ReviewedAt = now;
        AdminNote = note;
        UpdatedAt = now;
    }

    public void MarkRejected(long reviewedBy, string? note, DateTime now)
    {
        Status = WalletDepositRequestStatus.Rejected;
        ReviewedBy = reviewedBy;
        ReviewedAt = now;
        AdminNote = note;
        UpdatedAt = now;
    }
}
