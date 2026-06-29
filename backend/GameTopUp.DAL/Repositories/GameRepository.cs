using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.DAL.Repositories;

public sealed class GameRepository : IGameRepository
{
    private readonly DatabaseContext _database;

    public GameRepository(DatabaseContext database)
    {
        _database = database;
    }

    public Task<Game?> GetByIdAsync(long id) => _database.GetByIdAsync<Game>(id);

    public Task<List<Game>> GetAllAsync() => _database.QueryAsync<Game>("SELECT * FROM games ORDER BY created_at DESC");

    public Task<List<Game>> GetActiveAsync() => _database.QueryAsync<Game>("SELECT * FROM games WHERE is_active = 1 ORDER BY created_at DESC");

    public Task<long> CreateAsync(Game game) => _database.InsertAsync(game);

    public Task<bool> UpdateAsync(Game game) => _database.UpdateAsync(game);

    public Task<int> DeleteAsync(long id) => _database.ExecuteAsync("DELETE FROM games WHERE id = @Id", new { Id = id });
}
