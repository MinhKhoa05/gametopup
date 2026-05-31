using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.DTOs.Wallets
{
    public class DepositRequestResponseDTO
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public decimal Amount { get; set; }
        public string Code { get; set; } = null!;
        public string TransferContent { get; set; } = null!;
        public string QrImageUrl { get; set; } = null!;
        public string BankId { get; set; } = null!;
        public string AccountNo { get; set; } = null!;
        public string AccountName { get; set; } = null!;
        public WalletDepositRequestStatus Status { get; set; }
        public DateTime? UserConfirmedAt { get; set; }
        public long? ReviewedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? AdminNote { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
