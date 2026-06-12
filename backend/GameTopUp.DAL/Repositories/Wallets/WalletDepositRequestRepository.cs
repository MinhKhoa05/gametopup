using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;

namespace GameTopUp.DAL.Repositories.Wallets;

public sealed class WalletDepositRequestRepository : IWalletDepositRequestRepository
{
    private readonly DatabaseContext _database;

    public WalletDepositRequestRepository(DatabaseContext database)
    {
        _database = database;
    }

    public Task<long> CreateAsync(WalletDepositRequest request) =>
        _database.InsertAsync<WalletDepositRequest, long>(request);

    public Task<WalletDepositRequest?> GetByIdAsync(long requestId) =>
        _database.GetByIdAsync<WalletDepositRequest>(requestId);

    public Task<WalletDepositRequest?> GetWithLockByIdAsync(long requestId) =>
        _database.QueryFirstAsync<WalletDepositRequest>(
            "SELECT * FROM wallet_deposit_requests WHERE id = @Id FOR UPDATE",
            new { Id = requestId });

    public Task<List<WalletDepositRequest>> GetByUserIdAsync(long userId, WalletDepositRequestStatus? status = null) =>
        _database.QueryAsync<WalletDepositRequest>(
            @"SELECT *
              FROM wallet_deposit_requests
              WHERE user_id = @UserId
                AND (@Status IS NULL OR status = @Status)
              ORDER BY created_at DESC",
            new { UserId = userId, Status = status });

    public Task<List<WalletDepositRequest>> GetAllAsync(WalletDepositRequestStatus? status = null) =>
        _database.QueryAsync<WalletDepositRequest>(
            @"SELECT *
              FROM wallet_deposit_requests
              WHERE (@Status IS NULL OR status = @Status)
              ORDER BY created_at DESC",
            new { Status = status });

    public Task<bool> UpdateAsync(WalletDepositRequest request) => _database.UpdateAsync(request);
}
