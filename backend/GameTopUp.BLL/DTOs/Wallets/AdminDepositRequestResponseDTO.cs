using GameTopUp.DAL.Entities.Wallets;

namespace GameTopUp.BLL.DTOs.Wallets;

public sealed class AdminDepositRequestResponseDTO
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public decimal Amount { get; set; }
    public string Code { get; set; } = string.Empty;
    public WalletDepositRequestStatus Status { get; set; }
    public DateTime? UserConfirmedAt { get; set; }
    public long? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
