using Dapper;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using System.Text;

namespace GameTopUp.DAL.Repositories;

public sealed class OrderRepository : IOrderRepository
{
    private readonly DatabaseContext _database;

    public OrderRepository(DatabaseContext database)
    {
        _database = database;
    }

    public Task<List<Order>> GetAllAsync(OrderStatus? status = null)
    {
        var sql = new StringBuilder("SELECT * FROM orders");
        var parameters = new DynamicParameters();

        if (status is not null)
        {
            sql.AppendLine(" WHERE status = @Status");
            parameters.Add("Status", status);
        }

        sql.AppendLine(" ORDER BY created_at DESC");

        return _database.QueryAsync<Order>(sql.ToString(), parameters);
    }

    public Task<Order?> GetByIdAsync(long orderId) => _database.GetByIdAsync<Order>(orderId);

    public Task<Order?> GetWithLockByIdAsync(long orderId) =>
        _database.QueryFirstOrDefaultAsync<Order>("SELECT * FROM orders WHERE id = @Id FOR UPDATE", new { Id = orderId });

    public Task<bool> UpdateAsync(Order order) => _database.UpdateAsync(order);

    public Task<List<Order>> GetByUserIdAsync(long userId, OrderStatus? status = null)
    {
        var sql = new StringBuilder(
            """
            SELECT *
            FROM orders
            WHERE user_id = @UserId
            """);
        sql.AppendLine();

        var parameters = new DynamicParameters();
        parameters.Add("UserId", userId);

        if (status is not null)
        {
            sql.AppendLine("AND status = @Status");
            parameters.Add("Status", status);
        }

        sql.AppendLine("ORDER BY created_at DESC");

        return _database.QueryAsync<Order>(sql.ToString(), parameters);
    }

    public Task<long> CreateAsync(Order order) => _database.InsertAsync(order);
}
