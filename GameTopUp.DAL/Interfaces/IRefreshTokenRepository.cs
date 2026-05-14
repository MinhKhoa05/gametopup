using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);
        Task<long> CreateAsync(RefreshToken refreshToken);
        Task<bool> RevokeTokenAsync(string tokenHash);
    }
}
