using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.DAL.Repositories
{
    public class WalletDepositRequestRepository : IWalletDepositRequestRepository
    {
        private readonly DatabaseContext _database;

        public WalletDepositRequestRepository(DatabaseContext database)
        {
            _database = database;
        }

        public async Task<long> CreateAsync(WalletDepositRequest request)
        {
            return await _database.InsertAsync<WalletDepositRequest, long>(request);
        }

        public async Task<WalletDepositRequest?> GetByIdAsync(long requestId)
        {
            const string sql = "SELECT * FROM wallet_deposit_requests WHERE id = @Id";
            return await _database.QueryFirstAsync<WalletDepositRequest>(sql, new { Id = requestId });
        }

        public async Task<WalletDepositRequest?> GetWithLockByIdAsync(long requestId)
        {
            const string sql = "SELECT * FROM wallet_deposit_requests WHERE id = @Id FOR UPDATE";
            return await _database.QueryFirstAsync<WalletDepositRequest>(sql, new { Id = requestId });
        }

        public async Task<List<WalletDepositRequest>> GetByUserIdAsync(long userId, WalletDepositRequestStatus? status = null)
        {
            const string sql = @"
                SELECT *
                FROM wallet_deposit_requests
                WHERE user_id = @UserId
                  AND (@Status IS NULL OR status = @Status)
                ORDER BY created_at DESC";

            return await _database.QueryAsync<WalletDepositRequest>(sql, new { UserId = userId, Status = status });
        }

        public async Task<List<WalletDepositRequest>> GetAllAsync(WalletDepositRequestStatus? status = null)
        {
            const string sql = @"
                SELECT *
                FROM wallet_deposit_requests
                WHERE (@Status IS NULL OR status = @Status)
                ORDER BY created_at DESC";

            return await _database.QueryAsync<WalletDepositRequest>(sql, new { Status = status });
        }

        public async Task<int> UpdateAsync(WalletDepositRequest request)
        {
            const string sql = @"
                UPDATE wallet_deposit_requests
                SET status = @Status,
                    user_confirmed_at = @UserConfirmedAt,
                    reviewed_by = @ReviewedBy,
                    reviewed_at = @ReviewedAt,
                    admin_note = @AdminNote,
                    updated_at = @UpdatedAt
                WHERE id = @Id";

            return await _database.ExecuteAsync(sql, new
            {
                request.Id,
                request.Status,
                request.UserConfirmedAt,
                request.ReviewedBy,
                request.ReviewedAt,
                request.AdminNote,
                request.UpdatedAt
            });
        }
    }
}
