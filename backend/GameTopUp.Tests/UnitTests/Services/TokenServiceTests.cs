using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.Options;
using GameTopUp.BLL.Services.Auth;
using GameTopUp.DAL.Entities.Users;
using Microsoft.Extensions.Options;

namespace GameTopUp.Tests.UnitTests.Services;

public class TokenServiceTests
{
    private readonly TokenService _service = new(Options.Create(new JwtSettings
    {
        Key = "this-is-a-test-key-that-is-long-enough-12345",
        Issuer = "GameTopUp.Tests",
        Audience = "GameTopUp.Tests",
        ExpireMinutes = 60
    }));

    [Fact]
    public void GenerateRefreshToken_ShouldReturnHexStringWithExpectedLength()
    {
        var refreshToken = _service.GenerateRefreshToken();
        var other = _service.GenerateRefreshToken();

        refreshToken.Should().NotBeNullOrWhiteSpace();
        refreshToken.Length.Should().Be(64);
        Convert.FromHexString(refreshToken).Length.Should().Be(32);
        other.Should().NotBe(refreshToken);
    }

    [Fact]
    public void HashToken_ShouldBeDeterministic_ForSameInput()
    {
        var first = _service.HashToken("refresh-token");
        var second = _service.HashToken("refresh-token");

        first.Should().Be(second);
        first.Length.Should().Be(64);
    }

    [Fact]
    public void GenerateAccessToken_ShouldEmbedUserClaims()
    {
        var token = _service.GenerateAccessToken(Payload());

        token.Should().NotBeNullOrWhiteSpace();

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);
        jwt.Claims.Should().Contain(claim => claim.Type == ClaimTypes.NameIdentifier && claim.Value == "7");
        jwt.Claims.Should().Contain(claim => claim.Type == ClaimTypes.Name && claim.Value == "Test User");
        jwt.Claims.Should().Contain(claim => claim.Type == JwtRegisteredClaimNames.Email && claim.Value == "user@test.local");
        jwt.Claims.Should().Contain(claim => claim.Type == ClaimTypes.Role && claim.Value == UserRole.Admin.ToString());
    }

    [Fact]
    public void GenerateAccessToken_ShouldUseConfiguredIssuerAudienceAndExpiry()
    {
        var token = _service.GenerateAccessToken(Payload());

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        jwt.Issuer.Should().Be("GameTopUp.Tests");
        jwt.Audiences.Should().Contain("GameTopUp.Tests");
        jwt.ValidTo.Should().BeAfter(DateTime.UtcNow.AddMinutes(55));
        jwt.ValidTo.Should().BeBefore(DateTime.UtcNow.AddMinutes(61));
    }

    private static TokenPayload Payload() => TokenPayload.Create(new UserContext
    {
        UserId = 7,
        DisplayName = "Test User",
        Email = "user@test.local",
        Role = UserRole.Admin
    });
}
