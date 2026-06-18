using GameTopUp.DAL.Entities.Games;

namespace GameTopUp.DAL.Interfaces.Games;

public interface IGameRepository
{
    Task<Game?> GetByIdAsync(long id);
    Task<List<Game>> GetAllAsync();
    Task<List<Game>> GetActiveAsync();
    Task<long> CreateAsync(Game game);
    Task<bool> UpdateAsync(Game game);
    Task<int> DeleteAsync(long id);
}
