namespace GameTopUp.BLL.DTOs.Wallets;

public sealed class WalletOverviewResponseDTO
{
    public decimal Balance { get; set; }
    public List<WalletTransactionInfo> Transactions { get; set; } = [];
    public List<WalletDepositRequestResponseDTO> DepositRequests { get; set; } = [];
}
