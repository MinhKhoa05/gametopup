using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace GameTopUp.DAL.Entities
{
    [Table("order_history")]
    public class OrderHistory
    {
        [Key]
        public long Id { get; set; }

        public long OrderId { get; set; }


        public OrderStatus FromStatus { get; set; }
        public OrderStatus ToStatus { get; set; }

        public string? Note { get; set; }

        public long ActionBy { get; set; }

        public bool IsAdmin { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
