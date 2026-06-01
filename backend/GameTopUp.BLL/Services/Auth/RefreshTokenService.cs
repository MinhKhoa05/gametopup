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

        /// <summary>
        /// Revoke token cũ và trả về thông tin token đã bị revoke để tầng trên có thể lấy userId, log, v.v.
        /// </summary>
        public async Task<RefreshToken?> RevokeTokenAsync(string tokenHash)
        {
            var refreshToken = await _repo.GetByTokenHashAsync(tokenHash);

            if (!IsTokenAvailable(refreshToken))
            {
                return null; // Token không hợp lệ, trả về null để tầng trên xử lý.
            }

            var success = await _repo.RevokeTokenAsync(tokenHash); 
            if (!success)
            {
                return null;
            }

            return refreshToken;
        }

        private static bool IsTokenAvailable(RefreshToken? token)
        {
            if (token is null) return false;
            if (token.RevokedAt is not null) return false;
            if (token.ExpiresAt < DateTime.UtcNow) return false;

            return true; // Token hoàn toàn sạch sẽ, dùng được!
        }
    }
}
