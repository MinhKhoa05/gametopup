using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Interfaces;

public interface IWalletDepositRepository
{
    Task<long> CreateAsync(WalletDeposit request);
    Task<WalletDeposit?> GetByIdAsync(long requestId);
    Task<WalletDeposit?> GetWithLockByIdAsync(long requestId);
    Task<List<WalletDeposit>> GetByUserIdAsync(
        long userId,
        WalletDepositStatus[]? statuses,
        long? cursor,
        int take);
    Task<List<WalletDeposit>> GetAllAsync(
        WalletDepositStatus[]? statuses,
        long? cursor,
        int take);
    Task<bool> UpdateAsync(WalletDeposit request);
}
