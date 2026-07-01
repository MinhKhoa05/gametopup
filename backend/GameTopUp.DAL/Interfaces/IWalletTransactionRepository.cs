using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Interfaces;

public interface IWalletTransactionRepository
{
    Task<List<WalletTransaction>> GetByUserIdAsync(long userId);
    Task<List<WalletTransaction>> GetCursorPageByUserIdAsync(
        long userId,
        WalletTransactionType? type,
        long? cursor,
        int take);
    Task<long> CreateAsync(WalletTransaction walletTransaction);
}
