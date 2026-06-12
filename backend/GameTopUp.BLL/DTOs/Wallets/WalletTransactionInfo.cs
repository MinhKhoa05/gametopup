using GameTopUp.DAL.Entities.Wallets;

namespace GameTopUp.BLL.DTOs.Wallets;

public sealed class WalletTransactionInfo
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public decimal Amount { get; set; }
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }
    public WalletTransactionType Type { get; set; }
    public string? Description { get; set; }
    public long? ReferenceId { get; set; }
    public DateTime CreatedAt { get; set; }
}
