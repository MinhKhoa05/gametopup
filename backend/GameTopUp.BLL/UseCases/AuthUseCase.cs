using GameTopUp.BLL.Context;
using GameTopUp.BLL.Contracts;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Mappers;
using GameTopUp.BLL.Services.Auth;
using GameTopUp.DAL.Database;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces;

namespace GameTopUp.BLL.UseCases;

public sealed class AuthUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly IWalletRepository _walletRepository;
    private readonly TokenService _tokenService;
    private readonly PasswordService _passwordService;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly ITransactionManager _transaction;

    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);

    public AuthUseCase(
        IUserRepository userRepository,
        IWalletRepository walletRepository,
        TokenService tokenService,
        PasswordService passwordService,
        RefreshTokenService refreshTokenService,
        ITransactionManager transaction)
    {
        _userRepository = userRepository;
        _walletRepository = walletRepository;
        _tokenService = tokenService;
        _passwordService = passwordService;
        _refreshTokenService = refreshTokenService;
        _transaction = transaction;
    }

    public async Task RegisterAsync(CreateUserRequest request)
    {
        _passwordService.Validate(request.Password);
        var passwordHash = _passwordService.Hash(request.Password);

        await _transaction.ExecuteAsync(async () =>
        {
            if (await _userRepository.ExistsByEmailAsync(request.Email))
            {
                throw new BusinessException(ErrorCode.EmailExists);
            }

            var user = User.Create(request.DisplayName, request.Email, passwordHash);
            var userId = await _userRepository.CreateAsync(user);
            await _walletRepository.UpsertWalletAsync(Wallet.CreateForUser(userId));
        });
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user is null || !_passwordService.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException(ErrorCode.InvalidCredentials);
        }

        var tokens = await IssueTokenPairAsync(user.MapTo<UserContext>());

        return new AuthResponse
        {
            AccessToken = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken,
            User = user.MapTo<UserResponse>()
        };
    }

    public async Task<AuthResponse> RefreshAsync(string? refreshTokenString)
    {
        if (string.IsNullOrWhiteSpace(refreshTokenString))
        {
            throw new UnauthorizedException(ErrorCode.InvalidRefreshToken);
        }

        var hash = _tokenService.HashToken(refreshTokenString);

        return await _transaction.ExecuteAsync(async () =>
        {
            var refreshToken = await _refreshTokenService.RevokeValidTokenAsync(hash);

            var user = await GetUserOrThrowAsync(refreshToken.UserId);
            var tokens = await IssueTokenPairAsync(user.MapTo<UserContext>());

            return new AuthResponse
            {
                AccessToken = tokens.AccessToken,
                RefreshToken = tokens.RefreshToken
            };
        });
    }

    public async Task LogoutAsync(string? refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken)) return;

        try
        {
            var hash = _tokenService.HashToken(refreshToken);
            await _refreshTokenService.RevokeValidTokenAsync(hash);
        }
        catch (UnauthorizedException)
        {
            // Ignore revoke failures during logout
        }
    }

    public async Task ChangePasswordAsync(UserContext context, ChangePasswordRequest request)
    {
        _passwordService.Validate(request.NewPassword);

        var user = await GetUserOrThrowAsync(context.UserId);
        if (!_passwordService.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new BusinessException(ErrorCode.CurrentPasswordIncorrect);
        }

        await _userRepository.UpdatePasswordAsync(context.UserId, _passwordService.Hash(request.NewPassword));
    }

    private async Task<(string AccessToken, string RefreshToken)> IssueTokenPairAsync(UserContext user)
    {
        var tokenPayload = new TokenPayload
        {
            UserId = user.UserId,
            DisplayName = user.DisplayName,
            Email = user.Email,
            Role = user.Role
        };
        var accessToken = _tokenService.GenerateAccessToken(tokenPayload);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenHash = _tokenService.HashToken(refreshToken);

        await _refreshTokenService.CreateAsync(user.UserId, refreshTokenHash, RefreshTokenLifetime);

        return (accessToken, refreshToken);
    }

    private async Task<User> GetUserOrThrowAsync(long userId)
    {
        return await _userRepository.GetByIdAsync(userId)
            ?? throw new NotFoundException(ErrorCode.UserNotFound);
    }
}
