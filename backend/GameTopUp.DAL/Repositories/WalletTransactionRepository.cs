using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.DAL.Repositories;

public sealed class WalletTransactionRepository : IWalletTransactionRepository
{
    private readonly DatabaseContext _database;

    public WalletTransactionRepository(DatabaseContext database)
    {
        _database = database;
    }

    public Task<List<WalletTransaction>> GetByUserIdAsync(long userId) =>
        _database.QueryAsync<WalletTransaction>(
            "SELECT * FROM wallet_transactions WHERE user_id = @UserId ORDER BY created_at DESC",
            new { UserId = userId });

    public Task<long> CreateAsync(WalletTransaction walletTransaction) =>
        _database.InsertAsync(walletTransaction);
}
