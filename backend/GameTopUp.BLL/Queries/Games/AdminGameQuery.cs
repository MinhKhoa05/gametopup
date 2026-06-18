using Dapper;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Mappers.Games;
using GameTopUp.DAL.Database;

namespace GameTopUp.BLL.Queries.Games;

public sealed class AdminGameQuery
{
    private readonly DatabaseContext _database;

    public AdminGameQuery(DatabaseContext database)
    {
        _database = database;
    }

    public async Task<List<AdminGameSummaryResponse>> GetAllAsync()
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
        return rows.Select(GameMapper.ToAdminSummaryResponse).ToList();
    }
}
