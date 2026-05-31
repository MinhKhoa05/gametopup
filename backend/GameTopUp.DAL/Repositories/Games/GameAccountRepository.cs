using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Interfaces.Games;

namespace GameTopUp.DAL.Repositories.Games
{
    public class GameAccountRepository : IGameAccountRepository
    {
        private readonly DatabaseContext _database;

        public GameAccountRepository(DatabaseContext database)
        {
            _database = database;
        }

        public async Task<GameAccount?> GetByIdAsync(long id)
        {
            var sql = "SELECT * FROM game_accounts WHERE id = @Id";
            
            return await _database.QueryFirstAsync<GameAccount>(sql, new 
            { 
                Id = id 
            });
        }

        public async Task<List<GameAccount>> GetByUserIdAsync(long userId)
        {
            // Ưu tiên hiển thị tài khoản mặc định lên đầu danh sách để tối ưu trải nghiệm người dùng.
            var sql = "SELECT * FROM game_accounts WHERE user_id = @UserId ORDER BY is_default DESC, created_at DESC";
            
            return await _database.QueryAsync<GameAccount>(sql, new 
            { 
                UserId = userId 
            });
        }

        public async Task<long> CreateAsync(GameAccount gameAccount)
        {
            return await _database.InsertAsync<GameAccount, long>(gameAccount);
        }

        public async Task<bool> UpdateAsync(GameAccount gameAccount)
        {
            return await _database.UpdateAsync(gameAccount);
        }

        public async Task<int> DeleteAsync(long id)
        {
            var sql = "DELETE FROM game_accounts WHERE id = @Id";
            
            return await _database.ExecuteAsync(sql, new 
            { 
                Id = id 
            });
        }

        public async Task<int> SetDefaultAsync(long userId, long id)
        {
            // Reset toàn bộ tài khoản của người dùng về không mặc định.
            var sqlReset = "UPDATE game_accounts SET is_default = 0 WHERE user_id = @UserId";
            await _database.ExecuteAsync(sqlReset, new { UserId = userId });

            // Thiết lập tài khoản được chọn làm mặc định.
            var sqlSet = "UPDATE game_accounts SET is_default = 1 WHERE id = @Id AND user_id = @UserId";
            
            return await _database.ExecuteAsync(sqlSet, new 
            {
                Id = id, 
                UserId = userId 
            });
        }
    }
}
