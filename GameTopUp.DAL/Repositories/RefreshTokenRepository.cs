using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.DAL.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly DatabaseContext _database;

        public RefreshTokenRepository(DatabaseContext database)
        {
            _database = database;
        }

        public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash)
        {
            const string sql = "SELECT * FROM refresh_tokens WHERE token_hash = @TokenHash AND revoked_at IS NULL LIMIT 1";
            return await _database.QueryFirstAsync<RefreshToken>(sql, new { TokenHash = tokenHash });
        }

        public async Task<long> CreateAsync(RefreshToken refreshToken)
        {
            return await _database.InsertAsync<RefreshToken, long>(refreshToken);
        }

        public async Task<bool> RevokeTokenAsync(string tokenHash)
        {
            const string sql = "UPDATE refresh_tokens SET revoked_at = @Now WHERE token_hash = @TokenHash AND revoked_at IS NULL";
            var affected = await _database.ExecuteAsync(sql, new { TokenHash = tokenHash, Now = DateTime.UtcNow });
            return affected > 0;
        }
    }
}
