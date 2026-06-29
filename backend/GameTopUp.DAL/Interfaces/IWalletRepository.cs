using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Interfaces;

public interface IWalletRepository
{
    Task<Wallet?> GetByUserIdAsync(long userId);
    Task<Wallet?> GetWithLockByUserIdAsync(long userId);
    Task UpsertWalletAsync(Wallet wallet);
    Task<int> UpdateBalanceAsync(long walletId, decimal newBalance);
}
