using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GameTopUp.BLL.Services.Auth;

public sealed class TokenService
{
    private const int RefreshTokenByteSize = 32;
    private readonly JwtSettings _jwtSettings;
    private readonly SymmetricSecurityKey _securityKey;
    private readonly JwtSecurityTokenHandler _tokenHandler = new();

    public TokenService(IOptions<JwtSettings> jwtOptions)
    {
        _jwtSettings = jwtOptions.Value;
        _securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
    }

    public string GenerateAccessToken(TokenPayload payload)
    {
        var now = DateTimeOffset.UtcNow;

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, payload.UserId.ToString()),
            new(ClaimTypes.Name, payload.DisplayName),
            new(JwtRegisteredClaimNames.Email, payload.Email),
            new(ClaimTypes.Role, payload.Role.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: now.AddMinutes(_jwtSettings.ExpireMinutes).UtcDateTime,
            signingCredentials: new SigningCredentials(_securityKey, SecurityAlgorithms.HmacSha256));

        return _tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[RefreshTokenByteSize];
        RandomNumberGenerator.Fill(randomBytes);
        return Convert.ToHexString(randomBytes);
    }

    public string HashToken(string token)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }
}
