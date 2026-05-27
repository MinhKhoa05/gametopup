using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Interfaces.Games;

namespace GameTopUp.DAL.Repositories.Games
{
    /// <summary>
    /// Repository quản lý thông tin các trò chơi hỗ trợ nạp tiền.
    /// </summary>
    public class GameRepository : IGameRepository
    {
        private readonly DatabaseContext _database;

        public GameRepository(DatabaseContext database)
        {
            _database = database;
        }

        public async Task<Game?> GetByIdAsync(long id)
        {
            var sql = "SELECT * FROM games WHERE id = @Id";
            
            return await _database.QueryFirstAsync<Game>(sql, new 
            { 
                Id = id 
            });
        }

        public async Task<List<Game>> GetAllAsync()
        {
            var sql = "SELECT * FROM games";
            
            return await _database.QueryAsync<Game>(sql);
        }

        public async Task<long> CreateAsync(Game game)
        {
            var sql = @"INSERT INTO games (name, image_url, is_active) 
                        VALUES (@Name, @ImageUrl, @IsActive);
                        SELECT LAST_INSERT_ID();";
            
            return await _database.ScalarAsync<long>(sql, game);
        }

        public async Task<int> UpdateAsync(Game game)
        {
            var sql = @"UPDATE games 
                        SET name = @Name, image_url = @ImageUrl, is_active = @IsActive 
                        WHERE id = @Id";
            
            return await _database.ExecuteAsync(sql, game);
        }

        public async Task<int> DeleteAsync(long id)
        {
            var sql = "DELETE FROM games WHERE id = @Id";
            
            return await _database.ExecuteAsync(sql, new 
            { 
                Id = id 
            });
        }
    }
}
