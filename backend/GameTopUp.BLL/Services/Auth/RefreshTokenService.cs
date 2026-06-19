using GameTopUp.DAL.Entities.Auth;
using GameTopUp.DAL.Interfaces.Auth;

namespace GameTopUp.BLL.Services.Auth;

public sealed class RefreshTokenService
{
    private readonly IRefreshTokenRepository _repository;

    public RefreshTokenService(IRefreshTokenRepository repository)
    {
        _repository = repository;
    }

    public async Task CreateAsync(long userId, string tokenHash, TimeSpan lifetime)
    {
        await _repository.CreateAsync(RefreshToken.Create(userId, tokenHash, lifetime));
    }

    public async Task<RefreshToken?> RevokeValidTokenAsync(string tokenHash)
    {
        var refreshToken = await _repository.GetByTokenHashAsync(tokenHash);
        if (refreshToken is null || refreshToken.RevokedAt is not null || refreshToken.ExpiresAt < DateTime.UtcNow)
        {
            return null;
        }

        var success = await _repository.RevokeTokenAsync(tokenHash);
        return success ? refreshToken : null;
    }
}
