using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Interfaces;

public interface IPackageRepository
{
    Task<Package?> GetByIdAsync(long id);
    Task<List<Package>> GetActiveByGameIdAsync(long gameId);
    Task<List<Package>> GetByGameIdAsync(long gameId);
    Task<long> CreateAsync(Package package);
    Task<bool> UpdateAsync(Package package);
    Task<int> IncreaseStockAsync(long id, int quantity);
    Task<int> DecreaseStockAsync(long id, int quantity);
    Task<int> DeleteAsync(long id);
}
