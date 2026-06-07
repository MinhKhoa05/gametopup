using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities
{
    [Table("game_packages")]
    public class GamePackage
    {
        [Key]
        public long Id { get; set; }
        public string Name { get; set; } = null!;
        public string ImageUrl { get; set; } = string.Empty;
        public string? ImageRelativePath { get; set; }
        public long GameId { get; set; }

        public decimal SalePrice { get; set; }
        public decimal OriginalPrice { get; set; }
        public decimal ImportPrice { get; set; }

        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public GamePackage() { }

        public static GamePackage Create(
            string name,
            long gameId,
            decimal salePrice,
            decimal originalPrice,
            decimal importPrice,
            int stockQuantity = 0)
        {
            var now = DateTime.UtcNow;

            return new GamePackage
            {
                Name = name,
                GameId = gameId,
                SalePrice = salePrice,
                OriginalPrice = originalPrice,
                ImportPrice = importPrice,
                StockQuantity = stockQuantity,
                ImageUrl = string.Empty,
                ImageRelativePath = null,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };
        }

        public void SetBasicInfo(
            string name,
            decimal salePrice,
            decimal originalPrice,
            decimal importPrice,
            DateTime now)
        {
            Name = name.Trim();
            SalePrice = salePrice;
            OriginalPrice = originalPrice;
            ImportPrice = importPrice;
            UpdatedAt = now;
        }
    }
}
