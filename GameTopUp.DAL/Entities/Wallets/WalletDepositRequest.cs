using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities
{
    [Table("wallet_deposit_requests")]
    public class WalletDepositRequest
    {
        [Key]
        public long Id { get; set; }
        public long UserId { get; set; }
        public decimal Amount { get; set; }
        public string Code { get; set; } = null!;
        public string TransferContent { get; set; } = null!;
        public string QrImageUrl { get; set; } = null!;
        public WalletDepositRequestStatus Status { get; set; } = WalletDepositRequestStatus.Pending;
        public DateTime? UserConfirmedAt { get; set; }
        public long? ReviewedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? AdminNote { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public WalletDepositRequest()
        {
        }

        public static WalletDepositRequest Create (
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
    }

    public enum WalletDepositRequestStatus
    {
        Pending = 1,
        UserConfirmed = 2,
        Approved = 3,
        Rejected = 4
    }
}
