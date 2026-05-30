using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities
{
    [Table("wallets")]
    public class Wallet
    {
        [Key]
        public long Id { get; set; }

        public long UserId { get; set; }

        public decimal Balance { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Wallet()
        {
        }

        public static Wallet CreateForUser(long userId, decimal initialBalance = 0)
        {
            var now = DateTime.UtcNow;

            return new Wallet
            {
                UserId = userId,
                Balance = initialBalance,
                CreatedAt = now,
                UpdatedAt = now
            };
        }
    }
}
