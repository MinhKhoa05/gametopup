using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Queries;

public sealed class AdminDashboardQuery
{
    private readonly DatabaseContext _database;

    public AdminDashboardQuery(DatabaseContext database)
    {
        _database = database;
    }

    public async Task<AdminDashboardStatsResponse> GetStatsAsync()
    {
        var sql =
            """
            SELECT
                (SELECT COUNT(*) FROM games WHERE is_active = 1) AS active_games,
                (SELECT COUNT(*) FROM games) AS total_games,
                (SELECT COUNT(*) FROM packages WHERE is_active = 1) AS active_packages,
                (SELECT COUNT(*) FROM packages) AS total_packages,
                (SELECT COUNT(*) FROM orders WHERE status = @PendingOrderStatus) AS pending_orders,
                (SELECT COUNT(*) FROM wallet_deposits WHERE status IN @ActiveDepositStatuses) AS pending_deposits
            """;

        var stats = await _database.QueryFirstOrDefaultAsync<AdminDashboardStatsResponse>(
            sql,
            new
            {
                PendingOrderStatus = OrderStatus.Pending,
                ActiveDepositStatuses = new[] { WalletDepositStatus.Pending, WalletDepositStatus.UserConfirmed }
            });

        return stats ?? new AdminDashboardStatsResponse();
    }
}

public sealed class AdminDashboardStatsResponse
{
    public long ActiveGames { get; set; }
    public long TotalGames { get; set; }

    public long ActivePackages { get; set; }
    public long TotalPackages { get; set; }

    public long PendingOrders { get; set; }
    public long PendingDeposits { get; set; }
}
