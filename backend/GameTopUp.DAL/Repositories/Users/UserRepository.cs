using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Interfaces.Users;

namespace GameTopUp.DAL.Repositories.Users
{
    public class UserRepository : IUserRepository
    {
        private readonly DatabaseContext _database;

        public UserRepository(DatabaseContext database)
        {
            _database = database;
        }

        public async Task<User?> GetByIdAsync(long userId)
        {
            return await _database.GetByIdAsync<User>(userId);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            string sql = "SELECT * FROM users WHERE email = @Email";
            
            return await _database.QueryFirstAsync<User>(sql, new 
            { 
                Email = email 
            });
        }

        public async Task<long> CreateAsync(User user)
        {
            return await _database.InsertAsync<User, long>(user);
        }

        public async Task<int> UpdatePasswordAsync(long userId, string newPasswordHash)
        {
            string sql = "UPDATE users SET password_hash = @PasswordHash WHERE id = @UserId";
            
            return await _database.ExecuteAsync(sql, new 
            { 
                PasswordHash = newPasswordHash, 
                UserId = userId 
            });
        }

        public async Task<bool> UpdateAsync(User user)
        {
            return await _database.UpdateAsync(user);
        }

        public async Task<IEnumerable<User>> GetAllAsync(int page, int pageSize)
        {
            int offset = (page - 1) * pageSize;
            string sql = "SELECT * FROM users ORDER BY created_at DESC LIMIT @Limit OFFSET @Offset";
            
            return await _database.QueryAsync<User>(sql, new 
            { 
                Limit = pageSize, 
                Offset = offset 
            });
        }

        public async Task<int> DeleteAsync(long userId)
        {
            string sql = "UPDATE users SET is_active = 0 WHERE id = @UserId";
            
            return await _database.ExecuteAsync(sql, new 
            { 
                UserId = userId 
            });
        }

    }
}
