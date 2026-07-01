using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.DAL.Repositories;

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

    public Task<List<WalletDeposit>> GetByUserIdAsync(
        long userId,
        WalletDepositStatus[]? statuses,
        long? cursor,
        int take)
    {
        var sql =
            """
            SELECT *
            FROM wallet_deposits
            WHERE user_id = @UserId
            AND (@HasStatuses = FALSE OR status IN @Statuses)
            AND (@Cursor IS NULL OR id < @Cursor)
            ORDER BY id DESC
            LIMIT @Take
            """;

        return _database.QueryAsync<WalletDeposit>(
            sql,
            new
            {
                UserId = userId,
                HasStatuses = statuses?.Length > 0,
                Statuses = statuses ?? [],
                Cursor = cursor,
                Take = take
            });
    }

    public Task<List<WalletDeposit>> GetAllAsync(
        WalletDepositStatus[]? statuses,
        long? cursor,
        int take)
    {
        var sql =
            """
            SELECT *
            FROM wallet_deposits
            WHERE (@HasStatuses = FALSE OR status IN @Statuses)
            AND (@Cursor IS NULL OR id < @Cursor)
            ORDER BY id DESC
            LIMIT @Take
            """;

        return _database.QueryAsync<WalletDeposit>(
            sql,
            new
            {
                HasStatuses = statuses?.Length > 0,
                Statuses = statuses ?? [],
                Cursor = cursor,
                Take = take
            });
    }

    public Task<bool> UpdateAsync(WalletDeposit request) => _database.UpdateAsync(request);
}
