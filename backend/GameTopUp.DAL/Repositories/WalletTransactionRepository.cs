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

    public Task<List<WalletTransaction>> GetByUserIdAsync(
        long userId,
        WalletTransactionType? type,
        long? cursor,
        int take)
    {
        var sql =
            """
            SELECT *
            FROM wallet_transactions
            WHERE user_id = @UserId
            AND (@Type IS NULL OR type = @Type)
            AND (@Cursor IS NULL OR id < @Cursor)
            ORDER BY id DESC
            LIMIT @Take
            """;

        return _database.QueryAsync<WalletTransaction>(
            sql,
            new
            {
                UserId = userId,
                Type = type,
                Cursor = cursor,
                Take = take
            });
    }

    public Task<long> CreateAsync(WalletTransaction walletTransaction) =>
        _database.InsertAsync(walletTransaction);
}
