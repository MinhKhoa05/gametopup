using FluentAssertions;
using GameTopUp.BLL.Services.Auth;
using GameTopUp.DAL.Entities.Auth;
using GameTopUp.DAL.Interfaces.Auth;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services.Auth;

public class RefreshTokenServiceTests
{
    private readonly Mock<IRefreshTokenRepository> _repository = new();
    private readonly RefreshTokenService _service;

    public RefreshTokenServiceTests()
    {
        _service = new RefreshTokenService(_repository.Object);
    }

    [Fact]
    public async Task CreateAsync_ShouldPersistCreatedRefreshToken()
    {
        RefreshToken? created = null;
        _repository.Setup(repo => repo.CreateAsync(It.IsAny<RefreshToken>()))
            .ReturnsAsync(12)
            .Callback<RefreshToken>(token => created = token);

        await _service.CreateAsync(7, "HASH", TimeSpan.FromDays(7));

        created.Should().NotBeNull();
        created!.UserId.Should().Be(7);
        created.TokenHash.Should().Be("HASH");
        created.ExpiresAt.Should().BeAfter(created.CreatedAt);
        _repository.Verify(repo => repo.CreateAsync(It.IsAny<RefreshToken>()), Times.Once);
    }

    [Fact]
    public async Task RevokeValidTokenAsync_ShouldReturnNull_WhenTokenDoesNotExist()
    {
        _repository.Setup(repo => repo.GetByTokenHashAsync("HASH"))
            .ReturnsAsync((RefreshToken?)null);

        var result = await _service.RevokeValidTokenAsync("HASH");

        result.Should().BeNull();
        _repository.Verify(repo => repo.RevokeTokenAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task RevokeValidTokenAsync_ShouldReturnNull_WhenTokenWasAlreadyRevoked()
    {
        _repository.Setup(repo => repo.GetByTokenHashAsync("HASH"))
            .ReturnsAsync(new RefreshToken
            {
                UserId = 7,
                TokenHash = "HASH",
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                ExpiresAt = DateTime.UtcNow.AddDays(6),
                RevokedAt = DateTime.UtcNow
            });

        var result = await _service.RevokeValidTokenAsync("HASH");

        result.Should().BeNull();
        _repository.Verify(repo => repo.RevokeTokenAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task RevokeValidTokenAsync_ShouldReturnNull_WhenTokenExpired()
    {
        _repository.Setup(repo => repo.GetByTokenHashAsync("HASH"))
            .ReturnsAsync(new RefreshToken
            {
                UserId = 7,
                TokenHash = "HASH",
                CreatedAt = DateTime.UtcNow.AddDays(-8),
                ExpiresAt = DateTime.UtcNow.AddMinutes(-1)
            });

        var result = await _service.RevokeValidTokenAsync("HASH");

        result.Should().BeNull();
        _repository.Verify(repo => repo.RevokeTokenAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task RevokeValidTokenAsync_ShouldReturnToken_WhenRevocationSucceeds()
    {
        var token = new RefreshToken
        {
            UserId = 7,
            TokenHash = "HASH",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            ExpiresAt = DateTime.UtcNow.AddDays(6)
        };
        _repository.Setup(repo => repo.GetByTokenHashAsync("HASH"))
            .ReturnsAsync(token);
        _repository.Setup(repo => repo.RevokeTokenAsync("HASH"))
            .ReturnsAsync(true);

        var result = await _service.RevokeValidTokenAsync("HASH");

        result.Should().BeSameAs(token);
        _repository.Verify(repo => repo.RevokeTokenAsync("HASH"), Times.Once);
    }
}
