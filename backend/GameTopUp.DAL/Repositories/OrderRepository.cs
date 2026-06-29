using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.DAL.Repositories;

public sealed class OrderRepository : IOrderRepository
{
    private readonly DatabaseContext _database;

    public OrderRepository(DatabaseContext database)
    {
        _database = database;
    }

    public Task<List<Order>> GetAllAsync(OrderStatus? status = null) =>
        _database.QueryAsync<Order>(
            "SELECT * FROM orders WHERE (@Status IS NULL OR status = @Status) ORDER BY created_at DESC",
            new { Status = status });

    public Task<Order?> GetByIdAsync(long orderId) => _database.GetByIdAsync<Order>(orderId);

    public Task<Order?> GetWithLockByIdAsync(long orderId) =>
        _database.QueryFirstOrDefaultAsync<Order>("SELECT * FROM orders WHERE id = @Id FOR UPDATE", new { Id = orderId });

    public Task<bool> UpdateAsync(Order order) => _database.UpdateAsync(order);

    public Task<List<Order>> GetByUserIdAsync(long userId, OrderStatus? status = null) =>
        _database.QueryAsync<Order>(
            @"SELECT *
              FROM orders
              WHERE user_id = @UserId
                AND (@Status IS NULL OR status = @Status)
              ORDER BY created_at DESC",
            new { UserId = userId, Status = status });

    public Task<long> CreateAsync(Order order) => _database.InsertAsync(order);
}
