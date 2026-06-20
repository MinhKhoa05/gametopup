using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities.Auth;
using GameTopUp.DAL.Interfaces.Auth;

namespace GameTopUp.DAL.Repositories.Auth;

public sealed class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly DatabaseContext _database;

    public RefreshTokenRepository(DatabaseContext database)
    {
        _database = database;
    }

    public Task<RefreshToken?> GetByTokenHashAsync(string tokenHash) =>
        _database.QueryFirstAsync<RefreshToken>(
            "SELECT * FROM refresh_tokens WHERE token_hash = @TokenHash",
            new { TokenHash = tokenHash });

    public Task<long> CreateAsync(RefreshToken refreshToken) =>
        _database.InsertAsync<RefreshToken, long>(refreshToken);

    public async Task<bool> RevokeTokenAsync(string tokenHash)
    {
        var affected = await _database.ExecuteAsync(
            "UPDATE refresh_tokens SET revoked_at = @Now WHERE token_hash = @TokenHash AND revoked_at IS NULL",
            new { TokenHash = tokenHash, Now = DateTime.UtcNow });

        return affected > 0;
    }
}
