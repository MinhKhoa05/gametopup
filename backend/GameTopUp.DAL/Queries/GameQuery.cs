using GameTopUp.DAL.Database;

namespace GameTopUp.DAL.Queries;

public sealed class GameQuery
{
    private readonly DatabaseContext _database;

    public GameQuery(DatabaseContext database)
    {
        _database = database;
    }

    public async Task<List<GameQueryRow>> GetGameQueryAsync()
    {
        var sql =
            """
                SELECT
                    g.id,
                    g.name,
                    g.image_url,
                    SUM(CASE WHEN p.is_active = 1 THEN 1 ELSE 0 END) AS active_packages
                FROM games g
                JOIN packages p ON p.game_id = g.id
                WHERE g.is_active = 1
                GROUP BY
                    g.id,
                    g.name,
                    g.image_url
                ORDER BY active_packages DESC;
            """;
        
        return await _database.QueryAsync<GameQueryRow>(sql);
    }

    public async Task<List<GameQueryRow>> GetAdminGameQueryAsync()
    {
        var sql =
            """
                SELECT
                    g.id,
                    g.name,
                    g.image_url,
                    g.is_active,
                    SUM(CASE WHEN p.is_active = 1 THEN 1 ELSE 0 END) AS active_packages,
                    SUM(CASE WHEN p.is_active = 0 THEN 1 ELSE 0 END) AS inactive_packages,
                    g.created_at,
                    g.updated_at
                FROM games g
                LEFT JOIN packages p ON p.game_id = g.id
                GROUP BY
                    g.id,
                    g.name,
                    g.image_url,
                    g.is_active,
                    g.created_at,
                    g.updated_at
                ORDER BY active_packages DESC;
            """;

        return await _database.QueryAsync<GameQueryRow>(sql);
    }
}

public sealed class GameQueryRow
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }

    // User + Admin
    public int ActivePackages { get; set; }

    // Admin only
    public bool IsActive { get; set; }
    public int InactivePackages { get; set; }

    public int TotalPackages => ActivePackages + InactivePackages;

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}