using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;

namespace GameTopUp.DAL.Repositories.Games;

public sealed class GamePackageRepository : IGamePackageRepository
{
    private readonly DatabaseContext _database;

    public GamePackageRepository(DatabaseContext database)
    {
        _database = database;
    }

    public Task<GamePackage?> GetByIdAsync(long id) => _database.GetByIdAsync<GamePackage>(id);

    public Task<List<GamePackage>> GetAllAsync() => _database.QueryAsync<GamePackage>("SELECT * FROM game_packages ORDER BY created_at DESC");

    public Task<List<GamePackage>> GetByGameIdAsync(long gameId) =>
        _database.QueryAsync<GamePackage>(
            "SELECT * FROM game_packages WHERE game_id = @GameId AND is_active = 1 ORDER BY created_at DESC",
            new { GameId = gameId });

    public Task<long> CreateAsync(GamePackage gamePackage) => _database.InsertAsync<GamePackage, long>(gamePackage);

    public Task<bool> UpdateAsync(GamePackage gamePackage) => _database.UpdateAsync(gamePackage);

    public Task<int> IncreaseStockAsync(long id, int quantity) =>
        _database.ExecuteAsync(
            "UPDATE game_packages SET stock_quantity = stock_quantity + @Quantity, updated_at = CURRENT_TIMESTAMP WHERE id = @Id",
            new { Id = id, Quantity = quantity });

    public Task<int> DecreaseStockAsync(long id, int quantity) =>
        _database.ExecuteAsync(
            "UPDATE game_packages SET stock_quantity = stock_quantity - @Quantity, updated_at = CURRENT_TIMESTAMP WHERE id = @Id AND stock_quantity >= @Quantity",
            new { Id = id, Quantity = quantity });

    public Task<int> DeleteAsync(long id) => _database.ExecuteAsync("DELETE FROM game_packages WHERE id = @Id", new { Id = id });
}
