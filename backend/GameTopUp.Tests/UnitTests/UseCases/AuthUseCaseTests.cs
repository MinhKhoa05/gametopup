using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Options;
using GameTopUp.BLL.Services.Auth;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;
using Microsoft.Extensions.Options;
using Moq;

namespace GameTopUp.Tests.UnitTests.UseCases;

public class AuthUseCaseTests
{
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokenRepository = new();
    private readonly Mock<IWalletRepository> _walletRepository = new();
    private readonly ITransactionManager _transaction = new ImmediateTransactionManager();
    private readonly AuthUseCase _useCase;
    private readonly PasswordService _passwordService = new();
    private readonly TokenService _tokenService;

    public AuthUseCaseTests()
    {
        _tokenService = new TokenService(Options.Create(new JwtSettings
        {
            Key = "this-is-a-test-key-that-is-long-enough-12345",
            Issuer = "GameTopUp.Tests",
            Audience = "GameTopUp.Tests",
            ExpireMinutes = 30
        }));

        var refreshTokenService = new RefreshTokenService(_refreshTokenRepository.Object);

        _useCase = new AuthUseCase(
            _userRepository.Object,
            _walletRepository.Object,
            _tokenService,
            _passwordService,
            refreshTokenService,
            _transaction);
    }

    [Fact]
    public async Task RegisterAsync_ShouldHashPasswordAndCreateWalletInTransaction()
    {
        User? createdUser = null;
        Wallet? createdWallet = null;

        _userRepository.Setup(repo => repo.ExistsByEmailAsync("user@test.local"))
            .ReturnsAsync(false);
        _userRepository.Setup(repo => repo.CreateAsync(It.IsAny<User>()))
            .ReturnsAsync(7)
            .Callback<User>(user => createdUser = user);
        _walletRepository.Setup(repo => repo.UpsertWalletAsync(It.IsAny<Wallet>()))
            .Returns(Task.CompletedTask)
            .Callback<Wallet>(wallet => createdWallet = wallet);

        await _useCase.RegisterAsync(CreateUserRequest());

        createdUser.Should().NotBeNull();
        createdUser!.PasswordHash.Should().NotBe("Password123!");
        _passwordService.Verify("Password123!", createdUser.PasswordHash).Should().BeTrue();
        createdWallet.Should().NotBeNull();
        createdWallet!.UserId.Should().Be(7);
        createdWallet.Balance.Should().Be(0m);
    }

    [Fact]
    public async Task RegisterAsync_ShouldThrow_WhenEmailAlreadyExists_AndSkipWalletCreation()
    {
        _userRepository.Setup(repo => repo.ExistsByEmailAsync("user@test.local"))
            .ReturnsAsync(true);

        var act = async () => await _useCase.RegisterAsync(CreateUserRequest());

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.EmailExists);
        _walletRepository.Verify(repo => repo.UpsertWalletAsync(It.IsAny<Wallet>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_ShouldThrow_WhenCredentialsAreInvalid()
    {
        var wrongHash = _passwordService.Hash("Password123!");
        _userRepository.Setup(repo => repo.GetByEmailAsync("user@test.local"))
            .ReturnsAsync(CreateUser(passwordHash: wrongHash));

        var act = async () => await _useCase.LoginAsync(new LoginRequest
        {
            Email = "user@test.local",
            Password = "WrongPass123!"
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidCredentials);
        _refreshTokenRepository.Verify(repo => repo.CreateAsync(It.IsAny<RefreshToken>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_ShouldThrow_WhenUserDoesNotExist()
    {
        _userRepository.Setup(repo => repo.GetByEmailAsync("missing@test.local"))
            .ReturnsAsync((User?)null);

        var act = async () => await _useCase.LoginAsync(new LoginRequest
        {
            Email = "missing@test.local",
            Password = "Password123!"
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidCredentials);
        _refreshTokenRepository.Verify(repo => repo.CreateAsync(It.IsAny<RefreshToken>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnTokens_WhenCredentialsAreValid()
    {
        RefreshToken? savedRefreshToken = null;
        var passwordHash = _passwordService.Hash("Password123!");

        _userRepository.Setup(repo => repo.GetByEmailAsync("user@test.local"))
            .ReturnsAsync(CreateUser(passwordHash: passwordHash, createdAt: DateTimeOffset.UtcNow.AddDays(-1)));
        _refreshTokenRepository.Setup(repo => repo.CreateAsync(It.IsAny<RefreshToken>()))
            .ReturnsAsync(12)
            .Callback<RefreshToken>(token => savedRefreshToken = token);

        var response = await _useCase.LoginAsync(new LoginRequest
        {
            Email = "user@test.local",
            Password = "Password123!"
        });

        response.AccessToken.Should().NotBeNullOrWhiteSpace();
        response.RefreshToken.Should().NotBeNullOrWhiteSpace();
        savedRefreshToken.Should().NotBeNull();
        savedRefreshToken!.UserId.Should().Be(7);
        savedRefreshToken.TokenHash.Should().NotBeNullOrWhiteSpace();
        savedRefreshToken.TokenHash.Length.Should().Be(64);
    }

    [Fact]
    public async Task RefreshAsync_ShouldThrow_WhenRefreshTokenIsInvalid()
    {
        _refreshTokenRepository.Setup(repo => repo.GetByTokenHashAsync(It.IsAny<string>()))
            .ReturnsAsync((RefreshToken?)null);

        var act = async () => await _useCase.RefreshAsync("invalid-refresh-token");

        await act.Should()
            .ThrowAsync<UnauthorizedException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidRefreshToken);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Refresh_ShouldThrowUnauthorized_WhenRefreshTokenIsEmpty(string? refreshToken)
    {
        var act = () => _useCase.RefreshAsync(refreshToken);

        await act.Should()
            .ThrowAsync<UnauthorizedException>()
            .Where(ex => ex.ErrorCode == ErrorCode.InvalidRefreshToken);
    }

    [Fact]
    public async Task RefreshAsync_ShouldReturnNewTokens_WhenRefreshTokenIsValid()
    {
        RefreshToken? savedRefreshToken = null;
        var hash = _tokenService.HashToken("refresh-token");

        _refreshTokenRepository.Setup(repo => repo.GetByTokenHashAsync(hash))
            .ReturnsAsync(CreateRefreshToken(hash, DateTimeOffset.UtcNow.AddDays(-1), DateTimeOffset.UtcNow.AddDays(6)));
        _refreshTokenRepository.Setup(repo => repo.RevokeAsync(hash))
            .ReturnsAsync(true);
        _userRepository.Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync(new User
            {
                Id = 7,
                DisplayName = "Test User",
                Email = "user@test.local",
                PasswordHash = _passwordService.Hash("Password123!"),
                Role = UserRole.Member,
                IsActive = true
            });
        _refreshTokenRepository.Setup(repo => repo.CreateAsync(It.IsAny<RefreshToken>()))
            .ReturnsAsync(12)
            .Callback<RefreshToken>(token => savedRefreshToken = token);

        var response = await _useCase.RefreshAsync("refresh-token");

        response.AccessToken.Should().NotBeNullOrWhiteSpace();
        response.RefreshToken.Should().NotBeNullOrWhiteSpace();
        savedRefreshToken.Should().NotBeNull();
        savedRefreshToken!.UserId.Should().Be(7);
    }

    [Fact]
    public async Task RefreshAsync_ShouldThrowUserNotFound_WhenRefreshTokenOwnerDoesNotExist()
    {
        var hash = _tokenService.HashToken("refresh-token");

        _refreshTokenRepository.Setup(repo => repo.GetByTokenHashAsync(hash))
            .ReturnsAsync(new RefreshToken
            {
                Id = 5,
                UserId = 7,
                TokenHash = hash,
                CreatedAt = DateTimeOffset.UtcNow.AddDays(-1),
                ExpiresAt = DateTimeOffset.UtcNow.AddDays(6)
            });
        _refreshTokenRepository.Setup(repo => repo.RevokeAsync(hash))
            .ReturnsAsync(true);
        _userRepository.Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync((User?)null);

        var act = async () => await _useCase.RefreshAsync("refresh-token");

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.UserNotFound);
        _refreshTokenRepository.Verify(repo => repo.CreateAsync(It.IsAny<RefreshToken>()), Times.Never);
    }

    [Fact]
    public async Task ChangePasswordAsync_ShouldThrow_WhenNewPasswordIsWeak_AndSkipPasswordUpdate()
    {
        var act = async () => await _useCase.ChangePasswordAsync(new UserContext { UserId = 7 }, new ChangePasswordRequest
        {
            CurrentPassword = "Password123!",
            NewPassword = "weakpass"
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.WeakPassword);
        _userRepository.Verify(repo => repo.GetByIdAsync(It.IsAny<long>()), Times.Never);
        _userRepository.Verify(repo => repo.UpdatePasswordAsync(It.IsAny<long>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task ChangePasswordAsync_ShouldThrow_WhenCurrentPasswordDoesNotMatch()
    {
        _userRepository.Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync(CreateUser(passwordHash: _passwordService.Hash("Password123!")));

        var act = async () => await _useCase.ChangePasswordAsync(new UserContext { UserId = 7 }, new ChangePasswordRequest
        {
            CurrentPassword = "WrongPass123!",
            NewPassword = "NewPass123!"
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.CurrentPasswordIncorrect);
        _userRepository.Verify(repo => repo.UpdatePasswordAsync(It.IsAny<long>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task ChangePasswordAsync_ShouldPersistHashedPassword_WhenCurrentPasswordMatches()
    {
        string? persistedHash = null;
        _userRepository.Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync(CreateUser(passwordHash: _passwordService.Hash("Password123!")));
        _userRepository.Setup(repo => repo.UpdatePasswordAsync(7, It.IsAny<string>()))
            .ReturnsAsync(1)
            .Callback<long, string>((_, hash) => persistedHash = hash);

        await _useCase.ChangePasswordAsync(new UserContext { UserId = 7 }, new ChangePasswordRequest
        {
            CurrentPassword = "Password123!",
            NewPassword = "NewPass123!"
        });

        persistedHash.Should().NotBeNullOrWhiteSpace();
        _passwordService.Verify("NewPass123!", persistedHash!).Should().BeTrue();
    }

    [Fact]
    public async Task LogoutAsync_ShouldNotThrow_WhenTokenRevocationFails()
    {
        _refreshTokenRepository.Setup(repo => repo.RevokeAsync(It.IsAny<string>()))
            .ThrowsAsync(new InvalidOperationException("boom"));

        var act = async () => await _useCase.LogoutAsync("refresh-token");

        await act.Should().NotThrowAsync();
    }

    private static CreateUserRequest CreateUserRequest()
    {
        return new CreateUserRequest
        {
            DisplayName = "Test User",
            Email = "user@test.local",
            Password = "Password123!"
        };
    }

    private static User CreateUser(string? passwordHash = null, DateTimeOffset? createdAt = null, DateTimeOffset? updatedAt = null)
    {
        var now = DateTimeOffset.UtcNow;
        return new User
        {
            Id = 7,
            DisplayName = "Test User",
            Email = "user@test.local",
            PasswordHash = passwordHash ?? string.Empty,
            Role = UserRole.Member,
            IsActive = true,
            CreatedAt = createdAt ?? now,
            UpdatedAt = updatedAt ?? now
        };
    }

    private static RefreshToken CreateRefreshToken(string tokenHash, DateTimeOffset createdAt, DateTimeOffset expiresAt)
    {
        return new RefreshToken
        {
            Id = 5,
            UserId = 7,
            TokenHash = tokenHash,
            CreatedAt = createdAt,
            ExpiresAt = expiresAt
        };
    }
}
