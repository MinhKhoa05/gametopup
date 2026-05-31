using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities
{
    [Table("orders")]
    public class Order
    {
        [Key]
        public long Id { get; set; }

        public long UserId { get; set; }
        public string GameAccountInfo { get; set; } = null!;

        public long GamePackageId { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }

        [NotMapped]
        public decimal Total => UnitPrice * Quantity;

        public long? AssignedTo { get; set; }
        public DateTime? AssignedAt { get; set; }

        public OrderStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Order()
        {
        }

        public static Order Create(
            long userId,
            long gamePackageId,
            decimal unitPrice,
            int quantity,
            string gameAccountInfo)
        {
            var now = DateTime.UtcNow;

            return new Order
            {
                UserId = userId,
                GamePackageId = gamePackageId,
                UnitPrice = unitPrice,
                Quantity = quantity,
                GameAccountInfo = gameAccountInfo,

                Status = OrderStatus.Pending,

                AssignedTo = null,
                AssignedAt = null,

                CreatedAt = now,
                UpdatedAt = now
            };
        }

        public void UpdateStatus(OrderStatus newStatus, long? assignedTo = null)
        {
            var now = DateTime.UtcNow;

            Status = newStatus;
            UpdatedAt = now;

            if (assignedTo.HasValue)
            {
                AssignedTo = assignedTo;
                AssignedAt = now;
            }
        }
    }

    public enum OrderStatus
    {
        Pending = 1,        // Chờ thanh toán
        Paid = 2,           // Đã thanh toán, chờ xử lý
        Processing = 3,     // Admin đang xử lý
        Completed = 4,      // Hoàn thành
        Cancelled = 5       // Hủy đơn
    }
}