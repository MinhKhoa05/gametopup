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
            int expireDays)
        {
            // Dùng chung một mốc thời gian để tránh lệch milliseconds
            // giữa CreatedAt và ExpiresAt.
            var now = DateTime.UtcNow;

            var refreshToken = new RefreshToken
            {
                UserId = userId,
                TokenHash = tokenHash,

                // Luôn dùng UTC để tránh lỗi timezone.
                CreatedAt = now,

                // Refresh token cần thời gian hết hạn rõ ràng.
                ExpiresAt = now.AddDays(expireDays)
            };

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
                throw new BusinessException("Revoke thất bại");
        }
    }
}
