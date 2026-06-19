using Dapper;
using GameTopUp.DAL.Database;

namespace GameTopUp.DAL.Queries;

public sealed class GameQuery
{
    private readonly DatabaseContext _database;

    public GameQuery(DatabaseContext database)
    {
        _database = database;
    }

    public async Task<List<AdminGameSummaryRow>> GetAdminSummaryAsync()
    {
        await _database.EnsureOpenAsync();

        var sql = """
                  SELECT
                      g.id,
                      g.name,
                      g.image_url,
                      g.is_active,
                      COUNT(gp.id) AS package_count,
                      g.created_at,
                      g.updated_at
                  FROM games g
                  LEFT JOIN game_packages gp ON gp.game_id = g.id
                  GROUP BY g.id, g.name, g.image_url, g.is_active, g.created_at, g.updated_at
                  ORDER BY g.created_at DESC
                  """;

        var rows = await _database.Connection.QueryAsync<AdminGameSummaryRow>(sql);
        return rows.ToList();
    }
}

public sealed class AdminGameSummaryRow
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int PackageCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
