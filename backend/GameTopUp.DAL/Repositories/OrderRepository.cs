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

    public Task<Order?> GetByIdAsync(long orderId) => _database.GetByIdAsync<Order>(orderId);

    public Task<Order?> GetWithLockByIdAsync(long orderId) =>
        _database.QueryFirstOrDefaultAsync<Order>("SELECT * FROM orders WHERE id = @Id FOR UPDATE", new { Id = orderId });

    public Task<bool> UpdateAsync(Order order) => _database.UpdateAsync(order);

    public Task<long> CreateAsync(Order order) => _database.InsertAsync(order);
}
