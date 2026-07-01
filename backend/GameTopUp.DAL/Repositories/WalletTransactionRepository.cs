using Dapper;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using System.Text;

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

    public Task<List<WalletTransaction>> GetCursorPageByUserIdAsync(
        long userId,
        WalletTransactionType? type,
        long? cursor,
        int take)
    {
        var sql = new StringBuilder(
            """
            SELECT *
            FROM wallet_transactions
            WHERE user_id = @UserId
            """);
        sql.AppendLine();

        var parameters = new DynamicParameters();
        parameters.Add("UserId", userId);
        parameters.Add("Take", take);

        if (type is not null)
        {
            sql.AppendLine("AND type = @Type");
            parameters.Add("Type", type);
        }

        if (cursor is not null)
        {
            sql.AppendLine("AND id < @Cursor");
            parameters.Add("Cursor", cursor);
        }

        sql.AppendLine("ORDER BY id DESC");
        sql.AppendLine("LIMIT @Take");

        return _database.QueryAsync<WalletTransaction>(sql.ToString(), parameters);
    }

    public Task<long> CreateAsync(WalletTransaction walletTransaction) =>
        _database.InsertAsync(walletTransaction);
}
