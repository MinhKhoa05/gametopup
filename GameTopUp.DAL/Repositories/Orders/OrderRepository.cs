using System.Data.Common;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Interfaces.Orders;

namespace GameTopUp.DAL.Repositories.Orders
{
    public class OrderRepository : IOrderRepository
    {
        private readonly DatabaseContext _database;

        public OrderRepository(DatabaseContext database)
        {
            _database = database;
        }

        public async Task<List<Order>> GetAllAsync(OrderStatus? status = null)
        {
            var sql = "SELECT * FROM orders WHERE (@Status IS NULL OR status = @Status) ORDER BY created_at DESC";
            return await _database.QueryAsync<Order>(sql, new { Status = status });
        }

        public async Task<Order?> GetByIdAsync(long orderId)
        {
            return await _database.GetByIdAsync<Order>(orderId);
        }

        public async Task<Order?> GetWithLockByIdAsync(long orderId)
        {
            var sql = "SELECT * FROM orders WHERE id = @Id FOR UPDATE";
            
            return await _database.QueryFirstAsync<Order>(sql, new 
            { 
                Id = orderId 
            });
        }

        public async Task<bool> UpdateAsync(Order order)
        {
            return await _database.UpdateAsync(order);
        }

        public async Task<List<Order>> GetByUserIdAsync(long userId, OrderStatus? status = null)
        {
            // Hỗ trợ lọc theo trạng thái đơn hàng nếu người dùng yêu cầu.
            var sql = @"SELECT * FROM orders
                        WHERE user_id = @UserId
                        AND (@Status IS NULL OR status = @Status)
                        ORDER BY created_at DESC";
            
            return await _database.QueryAsync<Order>(sql, new 
            { 
                UserId = userId, 
                Status = status 
            });
        }

        public async Task<long> CreateAsync(Order order)
        {
            return await _database.InsertAsync<Order, long>(order);
        }

        public async Task<bool> HasPendingOrderAsync(long userId)
        {
            // WHY: Sử dụng cột is_pending (Generated Column) để tận dụng index idx_one_pending_per_user,
            // giúp kiểm tra nhanh chóng mà không cần quét toàn bộ trạng thái.
            var sql = "SELECT COUNT(1) FROM orders WHERE user_id = @UserId AND is_pending = 1";
            var count = await _database.QueryFirstAsync<int>(sql, new 
            { 
                UserId = userId
            });
            return count > 0;
        }
    }
}
