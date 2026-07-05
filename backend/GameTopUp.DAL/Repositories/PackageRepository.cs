using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.DAL.Repositories;

public sealed class PackageRepository : IPackageRepository
{
    private readonly DatabaseContext _database;

    public PackageRepository(DatabaseContext database)
    {
        _database = database;
    }

    public Task<Package?> GetByIdAsync(long id) => _database.GetByIdAsync<Package>(id);

    public Task<List<Package>> GetActiveByGameIdAsync(long gameId) =>
        _database.QueryAsync<Package>(
            "SELECT * FROM packages WHERE game_id = @GameId AND is_active = 1",
            new { GameId = gameId });

    public Task<List<Package>> GetByGameIdAsync(long gameId) =>
        _database.QueryAsync<Package>(
            "SELECT * FROM packages WHERE game_id = @GameId",
            new { GameId = gameId });
    
    public Task<long> CreateAsync(Package package) => _database.InsertAsync(package);

    public Task<bool> UpdateAsync(Package package) => _database.UpdateAsync(package);

    public Task<int> IncreaseStockAsync(long id, int quantity) =>
        _database.ExecuteAsync(
            "UPDATE packages SET available_slots = available_slots + @Quantity, updated_at = CURRENT_TIMESTAMP WHERE id = @Id",
            new { Id = id, Quantity = quantity });

    public Task<int> DecreaseStockAsync(long id, int quantity) =>
        _database.ExecuteAsync(
            "UPDATE packages SET available_slots = available_slots - @Quantity, updated_at = CURRENT_TIMESTAMP WHERE id = @Id AND available_slots >= @Quantity",
            new { Id = id, Quantity = quantity });

    public Task<int> DeleteAsync(long id) => _database.ExecuteAsync("DELETE FROM packages WHERE id = @Id", new { Id = id });
}
