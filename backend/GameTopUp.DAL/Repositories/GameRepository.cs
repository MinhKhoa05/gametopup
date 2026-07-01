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

    public Task<long> CreateAsync(Game game) => _database.InsertAsync(game);

    public Task<bool> UpdateAsync(Game game) => _database.UpdateAsync(game);

    public Task<int> DeleteAsync(long id) => _database.ExecuteAsync("DELETE FROM games WHERE id = @Id", new { Id = id });
}
