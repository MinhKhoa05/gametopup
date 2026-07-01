using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Interfaces;

public interface IGameRepository
{
    Task<Game?> GetByIdAsync(long id);
    Task<long> CreateAsync(Game game);
    Task<bool> UpdateAsync(Game game);
    Task<int> DeleteAsync(long id);
}
