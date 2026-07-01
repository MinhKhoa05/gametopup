using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Interfaces;

public interface IWalletDepositRepository
{
    Task<long> CreateAsync(WalletDeposit request);
    Task<WalletDeposit?> GetByIdAsync(long requestId);
    Task<WalletDeposit?> GetWithLockByIdAsync(long requestId);
    Task<List<WalletDeposit>> GetByUserIdAsync(long userId, WalletDepositStatus? status = null);
    Task<List<WalletDeposit>> GetCursorPageByUserIdAsync(
        long userId,
        IReadOnlyCollection<WalletDepositStatus>? statuses,
        long? cursor,
        int take);
    Task<List<WalletDeposit>> GetAllAsync(WalletDepositStatus? status = null);
    Task<List<WalletDeposit>> GetAllCursorPageAsync(
        IReadOnlyCollection<WalletDepositStatus>? statuses,
        long? cursor,
        int take);
    Task<bool> UpdateAsync(WalletDeposit request);
}
