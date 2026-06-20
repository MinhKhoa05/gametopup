using Dapper;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.DAL.Queries.Orders;

public sealed class OrderQuery
{
    private readonly DatabaseContext _database;

    public OrderQuery(DatabaseContext database)
    {
        _database = database;
    }

    public async Task<List<MyOrderSummaryRow>> GetMySummaryAsync(long userId, OrderStatus? status = null)
    {
        await _database.EnsureOpenAsync();

        var sql = """
                  SELECT
                      o.id,
                      o.game_account_info,
                      o.game_package_id,
                      gp.game_id AS game_id,
                      g.name AS game_name,
                      g.image_url AS game_image_url,
                      gp.name AS package_name,
                      gp.image_url AS package_image_url,
                      o.package_price,
                      o.status,
                      o.created_at,
                      o.updated_at
                  FROM orders o
                  LEFT JOIN game_packages gp ON gp.id = o.game_package_id
                  LEFT JOIN games g ON g.id = gp.game_id
                  WHERE o.user_id = @UserId
                    AND (@Status IS NULL OR o.status = @Status)
                  ORDER BY o.created_at DESC
                  """;

        var rows = await _database.Connection.QueryAsync<MyOrderSummaryRow>(sql, new { UserId = userId, Status = status });
        return rows.ToList();
    }

    public async Task<List<AdminOrderSummaryRow>> GetAdminSummaryAsync(OrderStatus? status = null)
    {
        await _database.EnsureOpenAsync();

        var sql = """
                  SELECT
                      o.id,
                      o.user_id,
                      o.game_account_info,
                      o.game_package_id,
                      o.package_price,
                      o.assigned_to,
                      o.assigned_at,
                      o.status,
                      o.created_at,
                      o.updated_at
                  FROM orders o
                  WHERE (@Status IS NULL OR o.status = @Status)
                  ORDER BY o.created_at DESC
                  """;

        var rows = await _database.Connection.QueryAsync<AdminOrderSummaryRow>(sql, new { Status = status });
        return rows.ToList();
    }
}

public sealed class MyOrderSummaryRow
{
    public long Id { get; set; }
    public string GameAccountInfo { get; set; } = string.Empty;
    public long GamePackageId { get; set; }
    public long? GameId { get; set; }
    public string? GameName { get; set; }
    public string? GameImageUrl { get; set; }
    public string? PackageName { get; set; }
    public string? PackageImageUrl { get; set; }
    public decimal PackagePrice { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public sealed class AdminOrderSummaryRow
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string GameAccountInfo { get; set; } = string.Empty;
    public long GamePackageId { get; set; }
    public decimal PackagePrice { get; set; }
    public long? AssignedTo { get; set; }
    public DateTime? AssignedAt { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
