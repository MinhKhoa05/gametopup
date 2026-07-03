using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Queries;

public sealed class WalletQuery
{
    private readonly DatabaseContext _database;

    public WalletQuery(DatabaseContext database)
    {
        _database = database;
    }

    public async Task<WalletStatsResponse> GetWalletStatsByUserAsync(long userId)
    {
        var sql =
            """
            SELECT
                COALESCE(SUM(CASE WHEN wt.type = @DepositType THEN wt.amount ELSE 0 END), 0) AS total_deposited,
                ABS(COALESCE(SUM(CASE WHEN wt.type = @PurchaseOrderType THEN wt.amount ELSE 0 END), 0)) AS total_spent,
                COUNT(wt.id) AS wallet_transactions,
                (
                    SELECT COUNT(*)
                    FROM wallet_deposits wd
                    WHERE wd.user_id = @UserId
                    AND wd.status = @ApprovedDepositStatus
                ) AS successful_deposits
            FROM wallets w
            LEFT JOIN wallet_transactions wt ON wt.user_id = w.user_id
            WHERE w.user_id = @UserId
            GROUP BY w.id
            """;

        return await _database.QueryFirstOrDefaultAsync<WalletStatsResponse>(
            sql,
            new
            {
                UserId = userId,
                DepositType = WalletTransactionType.Deposit,
                PurchaseOrderType = WalletTransactionType.PurchaseOrder,
                ApprovedDepositStatus = WalletDepositStatus.Approved
            }) ?? new WalletStatsResponse();
    }
}

public sealed class WalletStatsResponse
{
    public decimal TotalDeposited { get; set; }
    public decimal TotalSpent { get; set; }
    public long WalletTransactions { get; set; }
    public long SuccessfulDeposits { get; set; }
}
