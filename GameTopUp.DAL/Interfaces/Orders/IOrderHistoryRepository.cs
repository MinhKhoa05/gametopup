using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Interfaces.Orders
{
    public interface IOrderHistoryRepository
    {
        Task<List<OrderHistory>> GetByOrderIdAsync(long orderId);
        Task<long> CreateAsync(OrderHistory history);
    }
}
