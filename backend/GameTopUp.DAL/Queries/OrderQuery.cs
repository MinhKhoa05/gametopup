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

    public async Task<List<OrderQueryRow>> GetOrderQueryAsync(long userId, OrderStatus? status = null)
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
                    AND (@Status IS NULL OR o.status = @Status)
                ORDER BY o.created_at DESC
                """;

        return await _database.QueryAsync<OrderQueryRow>(sql, new { UserId = userId, Status = status });
    }

    public async Task<List<OrderQueryRow>> GetAdminOrdersAsync(OrderStatus? status = null)
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
                WHERE (@Status IS NULL OR o.status = @Status)
                ORDER BY o.created_at DESC
            """;

        return await _database.QueryAsync<OrderQueryRow>(sql, new { Status = status });
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
    public OrderStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
