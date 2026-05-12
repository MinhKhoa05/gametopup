using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Interfaces
{
    public interface IWalletRepository
    {
        Task<Wallet?> GetByUserIdAsync(long userId);
        Task<Wallet?> GetByUserIdForUpdateAsync(long userId);
        Task<long> CreateAsync(Wallet wallet);
        Task<int> UpdateBalanceAsync(long walletId, decimal newBalance);
    }
}
