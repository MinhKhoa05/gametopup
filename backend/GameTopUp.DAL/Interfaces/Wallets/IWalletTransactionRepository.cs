using GameTopUp.DAL.Entities.Wallets;

namespace GameTopUp.DAL.Interfaces.Wallets;

public interface IWalletTransactionRepository
{
    Task<List<WalletTransaction>> GetByUserIdAsync(long userId);
    Task<long> CreateAsync(WalletTransaction walletTransaction);
}
