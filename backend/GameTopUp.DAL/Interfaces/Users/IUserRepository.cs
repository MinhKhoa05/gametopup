using GameTopUp.DAL.Entities.Users;

namespace GameTopUp.DAL.Interfaces.Users;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(long userId);
    Task<User?> GetByEmailAsync(string email);
    Task<long> CreateAsync(User user);
    Task<bool> UpdateAsync(User user);
    Task<int> UpdatePasswordAsync(long userId, string newPasswordHash);
    Task<IEnumerable<User>> GetAllAsync(int page, int pageSize);
    Task<int> DeleteAsync(long userId);
    Task<bool> ExistsByEmailAsync(string email);
}
