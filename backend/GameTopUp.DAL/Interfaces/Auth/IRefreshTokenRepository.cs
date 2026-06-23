using GameTopUp.DAL.Entities.Auth;

namespace GameTopUp.DAL.Interfaces.Auth;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);
    Task<long> CreateAsync(RefreshToken refreshToken);
    Task<bool> RevokeAsync(string tokenHash);
}
