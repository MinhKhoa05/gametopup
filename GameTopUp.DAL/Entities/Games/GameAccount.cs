using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities
{
    [Table("game_accounts")]
    public class GameAccount
    {
        [Key]
        public long Id { get; set; }

        public long UserId { get; set; }

        public long GameId { get; set; }

        public string Name { get; set; } = null!;

        public string AccountIdentifier { get; set; } = null!;

        public string? Server { get; set; }

        public string? Description { get; set; }

        public bool IsDefault { get; set; }

        public DateTime CreatedAt { get; set; }

        public GameAccount()
        {
        }

        public static GameAccount Create(
            long userId,
            long gameId,
            string name,
            string accountIdentifier,
            string? server = null,
            string? description = null)
        {
            return new GameAccount
            {
                UserId = userId,
                GameId = gameId,
                Name = name,
                AccountIdentifier = accountIdentifier,
                Server = server,
                Description = description,
                IsDefault = false,
                CreatedAt = DateTime.UtcNow
            };
        }
    }
}