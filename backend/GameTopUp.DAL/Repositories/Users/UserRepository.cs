using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Interfaces.Users;

namespace GameTopUp.DAL.Repositories.Users;

public sealed class UserRepository : IUserRepository
{
    private readonly DatabaseContext _database;

    public UserRepository(DatabaseContext database)
    {
        _database = database;
    }

    public Task<User?> GetByIdAsync(long userId) => _database.GetByIdAsync<User>(userId);

    public Task<User?> GetByEmailAsync(string email) =>
        _database.QueryFirstAsync<User>("SELECT * FROM users WHERE email = @Email", new { Email = email });

    public Task<long> CreateAsync(User user) => _database.InsertAsync<User, long>(user);

    public Task<bool> UpdateAsync(User user) => _database.UpdateAsync(user);

    public Task<int> UpdatePasswordAsync(long userId, string newPasswordHash) =>
        _database.ExecuteAsync(
            "UPDATE users SET password_hash = @PasswordHash WHERE id = @UserId",
            new { PasswordHash = newPasswordHash, UserId = userId });

    public Task<IEnumerable<User>> GetAllAsync(int page, int pageSize)
    {
        return GetAllInternalAsync(page, pageSize);
    }

    public Task<int> DeleteAsync(long userId) =>
        _database.ExecuteAsync("UPDATE users SET is_active = 0 WHERE id = @UserId", new { UserId = userId });

    public Task<bool> ExistsByEmailAsync(string email) =>
        _database.ExecuteScalarAsync<bool>("SELECT EXISTS(SELECT 1 FROM users WHERE email = @Email)", new { Email = email });

    private async Task<IEnumerable<User>> GetAllInternalAsync(int page, int pageSize)
    {
        var offset = (page - 1) * pageSize;
        var users = await _database.QueryAsync<User>(
            "SELECT * FROM users ORDER BY created_at DESC LIMIT @Limit OFFSET @Offset",
            new { Limit = pageSize, Offset = offset });

        return users;
    }
}
