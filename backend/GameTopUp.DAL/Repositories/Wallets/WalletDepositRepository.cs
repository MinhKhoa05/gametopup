using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Wallets;
using GameTopUp.DAL.Interfaces.Wallets;

namespace GameTopUp.DAL.Repositories.Wallets;

public sealed class WalletDepositRepository : IWalletDepositRepository
{
    private readonly DatabaseContext _database;

    public WalletDepositRepository(DatabaseContext database)
    {
        _database = database;
    }

    public Task<long> CreateAsync(WalletDeposit request) =>
        _database.InsertAsync(request);

    public Task<WalletDeposit?> GetByIdAsync(long requestId) =>
        _database.GetByIdAsync<WalletDeposit>(requestId);

    public Task<WalletDeposit?> GetWithLockByIdAsync(long requestId) =>
        _database.QueryFirstOrDefaultAsync<WalletDeposit>(
            "SELECT * FROM wallet_deposits WHERE id = @Id FOR UPDATE",
            new { Id = requestId });

    public Task<List<WalletDeposit>> GetByUserIdAsync(long userId, WalletDepositStatus? status = null) =>
        _database.QueryAsync<WalletDeposit>(
            @"SELECT *
              FROM wallet_deposits
              WHERE user_id = @UserId
                AND (@Status IS NULL OR status = @Status)
              ORDER BY created_at DESC",
            new { UserId = userId, Status = status });

    public Task<List<WalletDeposit>> GetAllAsync(WalletDepositStatus? status = null) =>
        _database.QueryAsync<WalletDeposit>(
            @"SELECT *
              FROM wallet_deposits
              WHERE (@Status IS NULL OR status = @Status)
              ORDER BY created_at DESC",
            new { Status = status });

    public Task<bool> UpdateAsync(WalletDeposit request) => _database.UpdateAsync(request);
}
