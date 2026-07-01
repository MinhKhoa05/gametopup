using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(long orderId);
    Task<Order?> GetWithLockByIdAsync(long orderId);
    Task<bool> UpdateAsync(Order order);
    Task<long> CreateAsync(Order order);
}
