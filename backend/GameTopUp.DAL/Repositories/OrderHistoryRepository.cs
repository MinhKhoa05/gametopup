using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.DAL.Repositories;

public sealed class OrderHistoryRepository : IOrderHistoryRepository
{
    private readonly DatabaseContext _database;

    public OrderHistoryRepository(DatabaseContext database)
    {
        _database = database;
    }

    public Task<List<OrderHistory>> GetByOrderIdAsync(long orderId) =>
        _database.QueryAsync<OrderHistory>(
            "SELECT * FROM order_history WHERE order_id = @OrderId ORDER BY created_at",
            new { OrderId = orderId });

    public Task<long> CreateAsync(OrderHistory history) => _database.InsertAsync(history);
}
