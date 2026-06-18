using Dapper;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Mappers.Orders;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.BLL.Queries.Orders;

public sealed class MyOrderSummaryQuery
{
    private readonly DatabaseContext _database;

    public MyOrderSummaryQuery(DatabaseContext database)
    {
        _database = database;
    }

    public async Task<List<MyOrderSummaryResponseDTO>> GetByUserIdAsync(long userId, OrderStatus? status = null)
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
                      o.unit_price,
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
        return rows.Select(OrderMapper.ToMyOrderSummaryResponse).ToList();
    }
}
