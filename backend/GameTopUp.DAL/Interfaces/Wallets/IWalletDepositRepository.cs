using GameTopUp.DAL.Entities.Wallets;

namespace GameTopUp.DAL.Interfaces.Wallets;

public interface IWalletDepositRepository
{
    Task<long> CreateAsync(WalletDeposit request);
    Task<WalletDeposit?> GetByIdAsync(long requestId);
    Task<WalletDeposit?> GetWithLockByIdAsync(long requestId);
    Task<List<WalletDeposit>> GetByUserIdAsync(long userId, WalletDepositStatus? status = null);
    Task<List<WalletDeposit>> GetAllAsync(WalletDepositStatus? status = null);
    Task<bool> UpdateAsync(WalletDeposit request);
}
