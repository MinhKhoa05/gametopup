using GameTopUp.DAL.Entities.Games;

namespace GameTopUp.DAL.Interfaces.Games;

public interface IGamePackageRepository
{
    Task<GamePackage?> GetByIdAsync(long id);
    Task<List<GamePackage>> GetByGameIdAsync(long gameId);
    Task<long> CreateAsync(GamePackage gamePackage);
    Task<bool> UpdateAsync(GamePackage gamePackage);
    Task<int> IncreaseStockAsync(long id, int quantity);
    Task<int> DecreaseStockAsync(long id, int quantity);
    Task<int> DeleteAsync(long id);
}
