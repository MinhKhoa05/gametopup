using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Interfaces.Wallets;

namespace GameTopUp.DAL.Repositories.Wallets
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
            const string sql = @"
                SELECT * 
                FROM wallets 
                WHERE user_id = @UserId";

            return await _database.QueryFirstAsync<Wallet>(sql, new { UserId = userId });
        }

        public async Task<Wallet?> GetWithLockByUserIdAsync(long userId)
        {
            const string sql = @"
                SELECT * 
                FROM wallets 
                WHERE user_id = @UserId 
                FOR UPDATE";

            return await _database.QueryFirstAsync<Wallet>(sql, new { UserId = userId });
        }

        // WHY: Dùng ON DUPLICATE KEY để tạo ví an toàn (idempotent), không lỗi nếu đã tồn tại.
        public async Task UpsertWalletAsync(Wallet wallet)
        {
            const string sql = @"
                INSERT INTO wallets (user_id, balance, created_at, updated_at)
                VALUES (@UserId, @Balance, @CreatedAt, @UpdatedAt)
                ON DUPLICATE KEY UPDATE user_id = user_id;";

            await _database.ExecuteAsync(sql, new
            {
                wallet.UserId,
                wallet.Balance,
                wallet.CreatedAt,
                wallet.UpdatedAt
            });
        }

        public async Task<int> UpdateBalanceAsync(long walletId, decimal newBalance)
        {
            const string sql = @"
                UPDATE wallets 
                SET balance = @Balance, updated_at = @UpdatedAt 
                WHERE id = @Id";

            return await _database.ExecuteAsync(sql, new
            {
                Id = walletId,
                Balance = newBalance,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }
}
