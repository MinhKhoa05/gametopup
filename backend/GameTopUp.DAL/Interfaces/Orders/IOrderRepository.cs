using GameTopUp.DAL.Entities.Orders;

namespace GameTopUp.DAL.Interfaces.Orders;

public interface IOrderRepository
{
    Task<List<Order>> GetAllAsync(OrderStatus? status = null);
    Task<Order?> GetByIdAsync(long orderId);
    Task<Order?> GetWithLockByIdAsync(long orderId);
    Task<bool> UpdateAsync(Order order);
    Task<List<Order>> GetByUserIdAsync(long userId, OrderStatus? status = null);
    Task<long> CreateAsync(Order order);
}
