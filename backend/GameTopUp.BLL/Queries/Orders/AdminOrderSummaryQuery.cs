using Dapper;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Mappers.Orders;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.BLL.Queries.Orders;

public sealed class AdminOrderSummaryQuery
{
    private readonly DatabaseContext _database;

    public AdminOrderSummaryQuery(DatabaseContext database)
    {
        _database = database;
    }

    public async Task<List<AdminOrderSummaryResponseDTO>> GetAsync(OrderStatus? status = null)
    {
        await _database.EnsureOpenAsync();

        var sql = """
                  SELECT
                      o.id,
                      o.user_id,
                      o.game_account_info,
                      o.game_package_id,
                      o.unit_price,
                      o.unit_price AS total,
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
        return rows.Select(OrderMapper.ToAdminOrderSummaryResponse).ToList();
    }
}
