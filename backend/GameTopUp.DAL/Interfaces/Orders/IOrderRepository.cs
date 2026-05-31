using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Interfaces.Orders
{
    public interface IOrderRepository
    {
        Task<Order?> GetByIdAsync(long orderId);
        Task<Order?> GetWithLockByIdAsync(long orderId);
        Task<List<Order>> GetByUserIdAsync(long userId, OrderStatus? status = null);
        Task<List<Order>> GetAllAsync(OrderStatus? status = null);
        Task<long> CreateAsync(Order order);
        Task<bool> UpdateAsync(Order order);
        Task<bool> HasPendingOrderAsync(long userId);
    }
}
