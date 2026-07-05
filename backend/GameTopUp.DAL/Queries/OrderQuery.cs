using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Queries;

public sealed class OrderQuery
{
    private readonly DatabaseContext _database;

    public OrderQuery(DatabaseContext database)
    {
        _database = database;
    }

    public async Task<List<OrderQueryRow>> GetOrdersByUserAsync(
        long userId,
        OrderStatus[]? statuses,
        long? cursor,
        int take)
    {
        var sql =
            """
            SELECT
                o.id,
                o.user_id,
                o.game_account_info,
                o.package_id AS package_id,
                gp.game_id AS game_id,
                g.name AS game_name,
                o.package_name,
                COALESCE(gp.image_relative_path, gp.image_url) AS package_image_url,
                o.package_price,
                o.status,
                o.created_at,
                o.updated_at
            FROM orders o
            LEFT JOIN packages gp ON gp.id = o.package_id
            LEFT JOIN games g ON g.id = gp.game_id
            WHERE o.user_id = @UserId
            AND (@HasStatuses = FALSE OR o.status IN @Statuses)
            AND (@Cursor IS NULL OR o.id < @Cursor)
            ORDER BY o.id DESC
            LIMIT @Take
            """;

        return await _database.QueryAsync<OrderQueryRow>(
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

    public async Task<OrderStatsResponse> GetOrderStatsByUserAsync(long userId)
    {
        var sql =
            """
            SELECT
                COUNT(*) AS total_orders,
                COALESCE(SUM(CASE WHEN status IN @WatchingStatuses THEN 1 ELSE 0 END), 0) AS watching_orders,
                COALESCE(SUM(CASE WHEN status = @CompletedStatus THEN 1 ELSE 0 END), 0) AS completed_orders,
                COALESCE(SUM(CASE WHEN status <> @CancelledStatus THEN package_price ELSE 0 END), 0) AS total_spent
            FROM orders
            WHERE user_id = @UserId
            """;

        return await _database.QueryFirstOrDefaultAsync<OrderStatsResponse>(
            sql,
            new
            {
                UserId = userId,
                WatchingStatuses = new[] { OrderStatus.Pending, OrderStatus.Processing },
                CompletedStatus = OrderStatus.Completed,
                CancelledStatus = OrderStatus.Cancelled
            }) ?? new OrderStatsResponse();
    }

    public async Task<List<OrderQueryRow>> GetOrdersAsync(
        OrderStatus[]? statuses,
        long? cursor,
        int take)
    {
        var sql =
            """
            SELECT
                o.id,
                o.user_id,
                o.game_account_info,
                o.package_id AS package_id,
                g.name AS game_name,
                COALESCE(gp.image_relative_path, gp.image_url) AS package_image_url,
                o.package_name,
                o.package_price,
                o.package_cost,
                o.assigned_to,
                o.assigned_at,
                o.status,
                o.created_at,
                o.updated_at
            FROM orders o
            LEFT JOIN packages gp ON gp.id = o.package_id
            LEFT JOIN games g ON g.id = gp.game_id
            WHERE (@HasStatuses = FALSE OR o.status IN @Statuses)
            AND (@Cursor IS NULL OR o.id < @Cursor)
            ORDER BY o.id DESC
            LIMIT @Take
            """;

        return await _database.QueryAsync<OrderQueryRow>(
            sql,
            new
            {
                HasStatuses = statuses?.Length > 0,
                Statuses = statuses ?? [],
                Cursor = cursor,
                Take = take
            });
    }
}

public sealed class OrderQueryRow
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string GameAccountInfo { get; set; } = string.Empty;
    public long PackageId { get; set; }
    public long? GameId { get; set; }
    public string? GameName { get; set; }
    public string? PackageName { get; set; }
    public string? PackageImageUrl { get; set; }
    public decimal PackagePrice { get; set; }
    public decimal PackageCost { get; set; }
    public long? AssignedTo { get; set; }
    public DateTimeOffset? AssignedAt { get; set; }
    public OrderStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class OrderStatsResponse
{
    public long TotalOrders { get; set; }
    public long WatchingOrders { get; set; }
    public long CompletedOrders { get; set; }
    public decimal TotalSpent { get; set; }
}
