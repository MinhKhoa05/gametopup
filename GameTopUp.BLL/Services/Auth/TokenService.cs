using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.Options;

namespace GameTopUp.BLL.Services.Auth
{
    /// <summary>
    /// TokenService quản lý việc tạo JWT và Refresh Token.
    /// </summary>
    public class TokenService
    {
        // Dùng const để tránh magic number.
        private const int RefreshTokenByteSize = 32;

        private readonly JwtSettings _jwtSettings;
        private readonly SymmetricSecurityKey _securityKey;
        private readonly JwtSecurityTokenHandler _tokenHandler = new();

        public TokenService(IOptions<JwtSettings> jwtOptions)
        {
            _jwtSettings = jwtOptions.Value;

            // Key dùng để ký JWT bằng HMAC SHA256.
            _securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_jwtSettings.Key));
        }

        /// <summary>
        /// Tạo Access Token chứa thông tin người dùng.
        /// </summary>
        public string GenerateAccessToken(TokenPayload payload)
        {
            var now = DateTime.UtcNow;

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, payload.UserId.ToString()),
                new Claim(ClaimTypes.Name, payload.Name ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Email, payload.Email ?? string.Empty),
                new Claim(ClaimTypes.Role, payload.Role ?? string.Empty),

                // Mỗi token có ID riêng để hỗ trợ revoke/trace.
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),

                // Thời điểm token được tạo.
                new Claim(
                    JwtRegisteredClaimNames.Iat,
                    DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                    ClaimValueTypes.Integer64)
            };

            var credentials = new SigningCredentials(
                _securityKey,
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,

                // Access token nên có thời gian sống ngắn.
                expires: now.AddMinutes(_jwtSettings.ExpireMinutes),

                signingCredentials: credentials
            );

            return _tokenHandler.WriteToken(token);
        }

        /// <summary>
        /// Tạo Refresh Token ngẫu nhiên bảo mật cao.
        /// </summary>
        public string GenerateRefreshToken()
        {
            // 32 bytes ~ 256-bit entropy.
            byte[] randomBytes = new byte[RefreshTokenByteSize];

            // Dùng cryptographic random thay vì Random thường.
            RandomNumberGenerator.Fill(randomBytes);

            // Hex dễ lưu và không có ký tự đặc biệt.
            return Convert.ToHexString(randomBytes);
        }

        /// <summary>
        /// Băm Refresh Token trước khi lưu DB.
        /// </summary>
        public string HashToken(string token)
        {
            byte[] tokenBytes = Encoding.UTF8.GetBytes(token);

            // Chỉ lưu hash để tăng bảo mật nếu DB bị lộ.
            byte[] hashBytes = SHA256.HashData(tokenBytes);

            return Convert.ToHexString(hashBytes);
        }
    }
}
