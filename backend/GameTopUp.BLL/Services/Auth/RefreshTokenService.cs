using GameTopUp.BLL.Exceptions;
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

    public async Task<RefreshToken> RevokeValidTokenAsync(string tokenHash)
    {
        var refreshToken = await _repository.GetByTokenHashAsync(tokenHash)
            ?? throw new UnauthorizedException(ErrorCode.InvalidRefreshToken);

        if (refreshToken.RevokedAt is not null ||
            refreshToken.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            throw new UnauthorizedException(ErrorCode.InvalidRefreshToken);            
        }

        var success = await _repository.RevokeAsync(tokenHash);
        if (!success) throw new UnauthorizedException(ErrorCode.InvalidRefreshToken);

        return refreshToken;
    }
}
