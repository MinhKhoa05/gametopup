using FluentAssertions;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Auth;
using GameTopUp.DAL.Entities.Auth;
using GameTopUp.DAL.Interfaces.Auth;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services;

public class RefreshTokenServiceTests
{
    private readonly Mock<IRefreshTokenRepository> _repository = new();
    private readonly RefreshTokenService _service;

    public RefreshTokenServiceTests()
    {
        _service = new RefreshTokenService(_repository.Object);
    }

    [Theory]
    [MemberData(nameof(InvalidRefreshTokens))]
    public async Task RevokeValidTokenAsync_ShouldThrowUnauthorized_WhenTokenCannotBeUsed(
        RefreshToken? token)
    {
        _repository.Setup(repo => repo.GetByTokenHashAsync("HASH"))
            .ReturnsAsync(token);

        var act = () => _service.RevokeValidTokenAsync("HASH");

        await act.Should()
            .ThrowAsync<UnauthorizedException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidRefreshToken);

        _repository.Verify(
            repo => repo.RevokeAsync(It.IsAny<string>()),
            Times.Never);
    }

    [Fact]
    public async Task RevokeValidTokenAsync_ShouldReturnToken_WhenRevocationSucceeds()
    {
        var token = ValidToken();

        _repository.Setup(repo => repo.GetByTokenHashAsync("HASH"))
            .ReturnsAsync(token);

        _repository.Setup(repo => repo.RevokeAsync("HASH"))
            .ReturnsAsync(true);

        var result = await _service.RevokeValidTokenAsync("HASH");

        result.Should().BeSameAs(token);

        _repository.Verify(
            repo => repo.RevokeAsync("HASH"),
            Times.Once);
    }

    [Fact]
    public async Task RevokeValidTokenAsync_ShouldThrowUnauthorized_WhenRevocationFails()
    {
        var token = ValidToken();

        _repository.Setup(repo => repo.GetByTokenHashAsync("HASH"))
            .ReturnsAsync(token);

        _repository.Setup(repo => repo.RevokeAsync("HASH"))
            .ReturnsAsync(false);

        var act = () => _service.RevokeValidTokenAsync("HASH");

        await act.Should()
            .ThrowAsync<UnauthorizedException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidRefreshToken);

        _repository.Verify(
            repo => repo.RevokeAsync("HASH"),
            Times.Once);
    }

    public static TheoryData<RefreshToken?> InvalidRefreshTokens() => new()
    {
        null,
        new RefreshToken
        {
            UserId = 7,
            TokenHash = "HASH",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            ExpiresAt = DateTime.UtcNow.AddDays(6),
            RevokedAt = DateTime.UtcNow
        },
        new RefreshToken
        {
            UserId = 7,
            TokenHash = "HASH",
            CreatedAt = DateTime.UtcNow.AddDays(-8),
            ExpiresAt = DateTime.UtcNow.AddMinutes(-1)
        }
    };

    private static RefreshToken ValidToken() => new()
    {
        UserId = 7,
        TokenHash = "HASH",
        CreatedAt = DateTime.UtcNow.AddDays(-1),
        ExpiresAt = DateTime.UtcNow.AddDays(6)
    };
}