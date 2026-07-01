using Dapper;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using System.Text;

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
        var sql = new StringBuilder(
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
            """);
        sql.AppendLine();

        var parameters = new DynamicParameters();
        parameters.Add("UserId", userId);

        if (status is not null)
        {
            sql.AppendLine("AND o.status = @Status");
            parameters.Add("Status", status);
        }

        sql.AppendLine("ORDER BY o.created_at DESC");

        return await _database.QueryAsync<OrderQueryRow>(sql.ToString(), parameters);
    }

    public async Task<List<OrderQueryRow>> GetOrderCursorPageAsync(
        long userId,
        IReadOnlyCollection<OrderStatus>? statuses,
        long? cursor,
        int take)
    {
        var sql = new StringBuilder(
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
            """);
        sql.AppendLine();

        var parameters = new DynamicParameters();
        parameters.Add("UserId", userId);
        parameters.Add("Take", take);

        if (cursor is not null)
        {
            sql.AppendLine("AND o.id < @Cursor");
            parameters.Add("Cursor", cursor);
        }

        if (statuses is { Count: > 0 })
        {
            sql.AppendLine("AND o.status IN @Statuses");
            parameters.Add("Statuses", statuses);
        }

        sql.AppendLine("ORDER BY o.id DESC");
        sql.AppendLine("LIMIT @Take");

        return await _database.QueryAsync<OrderQueryRow>(sql.ToString(), parameters);
    }

    public async Task<List<OrderQueryRow>> GetAdminOrdersAsync(OrderStatus? status = null)
    {
        var sql = new StringBuilder(
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
            """);
        sql.AppendLine();

        var parameters = new DynamicParameters();

        if (status is not null)
        {
            sql.AppendLine("WHERE o.status = @Status");
            parameters.Add("Status", status);
        }

        sql.AppendLine("ORDER BY o.created_at DESC");

        return await _database.QueryAsync<OrderQueryRow>(sql.ToString(), parameters);
    }

    public async Task<List<OrderQueryRow>> GetAdminOrderCursorPageAsync(
        IReadOnlyCollection<OrderStatus>? statuses,
        long? cursor,
        int take)
    {
        var sql = new StringBuilder(
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
            WHERE 1 = 1
            """);
        sql.AppendLine();

        var parameters = new DynamicParameters();
        parameters.Add("Take", take);

        if (cursor is not null)
        {
            sql.AppendLine("AND o.id < @Cursor");
            parameters.Add("Cursor", cursor);
        }

        if (statuses is { Count: > 0 })
        {
            sql.AppendLine("AND o.status IN @Statuses");
            parameters.Add("Statuses", statuses);
        }

        sql.AppendLine("ORDER BY o.id DESC");
        sql.AppendLine("LIMIT @Take");

        return await _database.QueryAsync<OrderQueryRow>(sql.ToString(), parameters);
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
