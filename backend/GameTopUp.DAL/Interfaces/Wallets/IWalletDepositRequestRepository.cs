using GameTopUp.DAL.Entities.Wallets;

namespace GameTopUp.DAL.Interfaces.Wallets;

public interface IWalletDepositRequestRepository
{
    Task<long> CreateAsync(WalletDepositRequest request);
    Task<WalletDepositRequest?> GetByIdAsync(long requestId);
    Task<WalletDepositRequest?> GetWithLockByIdAsync(long requestId);
    Task<List<WalletDepositRequest>> GetByUserIdAsync(long userId, WalletDepositRequestStatus? status = null);
    Task<List<WalletDepositRequest>> GetAllAsync(WalletDepositRequestStatus? status = null);
    Task<bool> UpdateAsync(WalletDepositRequest request);
}
