using Dapper;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using System.Text;

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

    public Task<List<WalletDeposit>> GetByUserIdAsync(long userId, WalletDepositStatus? status = null)
    {
        var sql = new StringBuilder(
            """
            SELECT *
            FROM wallet_deposits
            WHERE user_id = @UserId
            """);
        sql.AppendLine();

        var parameters = new DynamicParameters();
        parameters.Add("UserId", userId);

        if (status is not null)
        {
            sql.AppendLine("AND status = @Status");
            parameters.Add("Status", status);
        }

        sql.AppendLine("ORDER BY created_at DESC");

        return _database.QueryAsync<WalletDeposit>(sql.ToString(), parameters);
    }

    public Task<List<WalletDeposit>> GetCursorPageByUserIdAsync(
        long userId,
        IReadOnlyCollection<WalletDepositStatus>? statuses,
        long? cursor,
        int take)
    {
        var sql = new StringBuilder(
            """
            SELECT *
            FROM wallet_deposits
            WHERE user_id = @UserId
            """);
        sql.AppendLine();

        var parameters = new DynamicParameters();
        parameters.Add("UserId", userId);
        parameters.Add("Take", take);

        if (cursor is not null)
        {
            sql.AppendLine("AND id < @Cursor");
            parameters.Add("Cursor", cursor);
        }

        if (statuses is { Count: > 0 })
        {
            sql.AppendLine("AND status IN @Statuses");
            parameters.Add("Statuses", statuses);
        }

        sql.AppendLine("ORDER BY id DESC");
        sql.AppendLine("LIMIT @Take");

        return _database.QueryAsync<WalletDeposit>(sql.ToString(), parameters);
    }

    public Task<List<WalletDeposit>> GetAllAsync(WalletDepositStatus? status = null)
    {
        var sql = new StringBuilder(
            """
            SELECT *
            FROM wallet_deposits
            """);
        sql.AppendLine();

        var parameters = new DynamicParameters();

        if (status is not null)
        {
            sql.AppendLine("WHERE status = @Status");
            parameters.Add("Status", status);
        }

        sql.AppendLine("ORDER BY created_at DESC");

        return _database.QueryAsync<WalletDeposit>(sql.ToString(), parameters);
    }

    public Task<List<WalletDeposit>> GetAllCursorPageAsync(
        IReadOnlyCollection<WalletDepositStatus>? statuses,
        long? cursor,
        int take)
    {
        var sql = new StringBuilder(
            """
            SELECT *
            FROM wallet_deposits
            WHERE 1 = 1
            """);
        sql.AppendLine();

        var parameters = new DynamicParameters();
        parameters.Add("Take", take);

        if (cursor is not null)
        {
            sql.AppendLine("AND id < @Cursor");
            parameters.Add("Cursor", cursor);
        }

        if (statuses is { Count: > 0 })
        {
            sql.AppendLine("AND status IN @Statuses");
            parameters.Add("Statuses", statuses);
        }

        sql.AppendLine("ORDER BY id DESC");
        sql.AppendLine("LIMIT @Take");

        return _database.QueryAsync<WalletDeposit>(sql.ToString(), parameters);
    }

    public Task<bool> UpdateAsync(WalletDeposit request) => _database.UpdateAsync(request);
}
