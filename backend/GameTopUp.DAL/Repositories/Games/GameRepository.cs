using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Interfaces.Games;

namespace GameTopUp.DAL.Repositories.Games
{
    public class GameRepository : IGameRepository
    {
        private readonly DatabaseContext _database;

        public GameRepository(DatabaseContext database)
        {
            _database = database;
        }

        public async Task<Game?> GetByIdAsync(long id)
        {
            return await _database.GetByIdAsync<Game>(id);
        }

        public async Task<List<Game>> GetAllAsync()
        {
            var sql = "SELECT * FROM games";
            
            return await _database.QueryAsync<Game>(sql);
        }

        public async Task<long> CreateAsync(Game game)
        {
            return await _database.InsertAsync<Game, long>(game);
        }

        public async Task<bool> UpdateAsync(Game game)
        {
            return await _database.UpdateAsync(game);
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
