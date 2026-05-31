using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Interfaces.Auth;
using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.Services.Auth
{
    public class RefreshTokenService
    {
        private readonly IRefreshTokenRepository _repo;

        public RefreshTokenService(IRefreshTokenRepository repo)
        {
            _repo = repo;
        }

        public async Task SaveRefreshTokenAsync(
            long userId,
            string tokenHash,
            TimeSpan lifetime)
        {
            var refreshToken = RefreshToken.Create(userId, tokenHash, lifetime);

            // Chỉ lưu hash thay vì raw token để tăng bảo mật.
            await _repo.CreateAsync(refreshToken);
        }

        public async Task<RefreshToken?> ValidateAndGetAsync(string tokenHash)
        {
            var refreshToken = await _repo.GetByTokenHashAsync(tokenHash);

            // Token không tồn tại.
            if (refreshToken is null)
                return null;

            // Token đã bị revoke.
            if (refreshToken.RevokedAt is not null)
                return null;

            // Token đã hết hạn.
            if (refreshToken.ExpiresAt < DateTime.UtcNow)
                return null;

            return refreshToken;
        }

        public async Task RevokeTokenAsync(string tokenHash)
        {
            var success = await _repo.RevokeTokenAsync(tokenHash);

            // Throw exception để tầng trên xử lý response phù hợp.
            if (!success)
                throw new BusinessException(ErrorCodes.RevokeTokenFailed);
        }
    }
}
