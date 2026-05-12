using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.DAL.Repositories
{
    public class WalletRepository : IWalletRepository
    {
        private readonly DatabaseContext _database;

        public WalletRepository(DatabaseContext database)
        {
            _database = database;
        }

        public async Task<Wallet?> GetByUserIdAsync(long userId)
        {
            string sql = "SELECT * FROM wallets WHERE user_id = @UserId";
            return await _database.QueryFirstAsync<Wallet>(sql, new { UserId = userId });
        }

        public async Task<Wallet?> GetByUserIdForUpdateAsync(long userId)
        {
            string sql = "SELECT * FROM wallets WHERE user_id = @UserId FOR UPDATE";
            return await _database.QueryFirstAsync<Wallet>(sql, new { UserId = userId });
        }

        public async Task<long> CreateAsync(Wallet wallet)
        {
            return await _database.InsertAsync<Wallet, long>(wallet);
        }

        public async Task<int> UpdateBalanceAsync(long walletId, decimal newBalance)
        {
            string sql = "UPDATE wallets SET balance = @Balance, updated_at = @UpdatedAt WHERE id = @Id";
            return await _database.ExecuteAsync(sql, new 
            {
                Id = walletId,
                Balance = newBalance,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }
}
